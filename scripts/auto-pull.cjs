#!/usr/bin/env node
/**
 * scripts/auto-pull.cjs — quiet `git pull --rebase` on session start.
 *
 * Wired in: .claude/settings.json SessionStart hook.
 *
 * Behavior:
 *   - If on a feature branch with a remote, fetch + rebase silently.
 *   - If clean rebase: exit silently.
 *   - If conflicts: append a warning to .claude/local-context.md (which whoami.cjs
 *     also writes — we APPEND so both signals coexist) and `git rebase --abort`
 *     so the working tree isn't left in a half-state. User resolves manually.
 *   - If no remote / detached HEAD / etc.: exit silently.
 *
 * Never blocks Claude Code startup — runs to completion in a few seconds at most.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CONTEXT_PATH = path.join(ROOT, '.claude', 'local-context.md');
const TIMEOUT_MS = 10_000;

function quiet(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

function appendContextWarning(message) {
  fs.mkdirSync(path.dirname(CONTEXT_PATH), { recursive: true });
  const banner = `\n\n## ⚠ Pull conflict on session start\n\n${message}\n\nResolve before continuing. The rebase was aborted to leave your working tree clean — pull manually with \`git pull --rebase\` and resolve conflicts when ready.\n`;
  fs.appendFileSync(CONTEXT_PATH, banner);
}

(function main() {
  // Only run inside a git repo.
  if (!quiet('git rev-parse --is-inside-work-tree')) return;

  // Skip if there's no remote.
  const remote = quiet('git config --get remote.origin.url');
  if (!remote) return;

  // Skip if branch has no upstream (avoid "fatal: no upstream").
  const upstream = quiet('git rev-parse --abbrev-ref --symbolic-full-name @{u}');
  if (!upstream) return;

  // Run rebase with timeout.
  const result = spawnSync('git', ['pull', '--rebase', '--autostash'], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
  });

  if (result.status === 0) {
    // Success — silent. (If the output is interesting, log to stderr for the hook to surface.)
    if (result.stdout && /Successfully rebased/.test(result.stdout)) {
      process.stderr.write(`📥 Pulled latest changes from ${upstream}.\n`);
    }
    return;
  }

  // Failure. Diagnose.
  const stderr = (result.stderr || '') + (result.stdout || '');
  if (/CONFLICT/i.test(stderr) || /rebase --abort/.test(stderr)) {
    quiet('git rebase --abort');
    appendContextWarning(`Conflict during \`git pull --rebase\` from ${upstream}. Files involved:\n\n\`\`\`\n${stderr.split('\n').slice(0, 30).join('\n')}\n\`\`\``);
    process.stderr.write(`⚠ Pull conflict on session start — see .claude/local-context.md\n`);
    return;
  }

  // Other failures (network down, etc.) — silent.
})();
