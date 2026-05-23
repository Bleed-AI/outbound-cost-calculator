#!/usr/bin/env node
// first-run-check.cjs — Auto-validate & fix common setup issues at session start.
//
// Wired via .claude/settings.json SessionStart hook. On the FIRST session for a
// fresh clone, runs ~10 checks and auto-fixes what it can (npm install, git
// hooks path, doppler link). On subsequent sessions, exits silently in <50ms
// after stat-ing a marker file.
//
// To force a re-run after fixing something manually: rm .claude/.first-run-complete

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const MARKER = path.join(REPO, '.claude', '.first-run-complete');
const HAS_PACKAGE = fs.existsSync(path.join(REPO, 'package.json'));
const HAS_HOOKS = fs.existsSync(path.join(REPO, '.githooks', 'pre-commit'));
const HAS_DOPPLER_YAML = fs.existsSync(path.join(REPO, 'doppler.yaml'));

// Fast path: marker exists → already validated → exit silently
if (fs.existsSync(MARKER)) {
  process.exit(0);
}

console.error('');
console.error('🔧 first-run-check: validating setup for this clone...');
console.error('');

let warnings = [];
let errors = [];

function check(label, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.error(`  ✓ ${label}`);
      return true;
    } else if (result && result.warn) {
      console.error(`  ⚠ ${label} — ${result.warn}`);
      warnings.push(`${label}: ${result.warn}`);
      return false;
    } else {
      console.error(`  ✗ ${label} — ${result}`);
      errors.push(`${label}: ${result}`);
      return false;
    }
  } catch (e) {
    console.error(`  ✗ ${label} — ${e.message}`);
    errors.push(`${label}: ${e.message}`);
    return false;
  }
}

function cmdExists(cmd) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'pipe' });
  return r.status === 0;
}

function tryRun(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'pipe', shell: process.platform === 'win32', ...opts });
  return { ok: r.status === 0, out: (r.stdout || '').toString(), err: (r.stderr || '').toString(), code: r.status };
}

// 1. node
check('node CLI installed', () => cmdExists('node') || 'install Node 18+ from nodejs.org');

// 2. git
check('git CLI installed', () => cmdExists('git') || 'install Git from git-scm.com');

// 3. gh (warning only — not all projects need it)
check('gh CLI installed', () => cmdExists('gh') || { warn: 'install for PR review: winget install GitHub.cli' });

// 4. doppler
const dopplerOk = check('doppler CLI installed', () => cmdExists('doppler') || 'install Doppler: winget install doppler.doppler');

// 5. doppler auth
if (dopplerOk) {
  check('doppler authenticated', () => {
    const r = tryRun('doppler', ['whoami', '--silent']);
    return r.ok || 'run: doppler login';
  });
}

// 6. doppler.yaml linkage (only if file exists)
if (dopplerOk && HAS_DOPPLER_YAML) {
  check('doppler.yaml present + valid', () => {
    const yaml = fs.readFileSync(path.join(REPO, 'doppler.yaml'), 'utf8');
    if (!/project:\s*\S+/.test(yaml) || !/config:\s*\S+/.test(yaml)) {
      return 'doppler.yaml missing project/config lines';
    }
    return true;
  });
}

// 7. npm deps auto-install
if (HAS_PACKAGE) {
  const hasNodeModules = fs.existsSync(path.join(REPO, 'node_modules'));
  if (!hasNodeModules) {
    console.error('  ⏳ npm install (deps missing — auto-installing, this may take 1-2 min)...');
    const r = tryRun('npm', ['install', '--no-audit', '--no-fund'], { stdio: 'inherit' });
    if (r.ok) {
      console.error('  ✓ npm install complete');
    } else {
      console.error('  ✗ npm install failed — run manually: npm install');
      errors.push('npm install failed');
    }
  } else {
    console.error('  ✓ node_modules present');
  }
}

// 8. git hooks path wired (auto-fix)
if (HAS_HOOKS) {
  check('pre-commit hook active', () => {
    const r = tryRun('git', ['config', 'core.hooksPath'], { cwd: REPO });
    const current = (r.out || '').trim();
    if (current === '.githooks') return true;
    // Auto-fix
    const fix = tryRun('git', ['config', 'core.hooksPath', '.githooks'], { cwd: REPO });
    return fix.ok ? true : `git config core.hooksPath .githooks (failed: ${fix.err})`;
  });
}

// 9. .claude/team-roster.json present (informational)
const ROSTER = path.join(REPO, '.claude', 'team-roster.json');
if (fs.existsSync(ROSTER)) {
  console.error('  ✓ team roster present');
}

// 10. Identity check (git user.email vs roster)
try {
  const email = tryRun('git', ['config', 'user.email'], { cwd: REPO }).out.trim();
  if (email && fs.existsSync(ROSTER)) {
    const roster = JSON.parse(fs.readFileSync(ROSTER, 'utf8'));
    const all = [...(roster.owners || []), ...(roster.teammates || [])].filter(p => !p._example);
    const me = all.find(p => {
      const emails = [p.email, ...(p.aliases || [])].filter(Boolean).map(e => e.toLowerCase());
      return emails.includes(email.toLowerCase());
    });
    if (me) {
      console.error(`  ✓ identity: ${me.name} (${me.role})`);
    } else {
      console.error(`  ⚠ git email "${email}" not in team-roster.json — ask Taha to add you via /onboard-team`);
      warnings.push(`identity: ${email} not in roster`);
    }
  }
} catch { /* non-fatal */ }

console.error('');

if (errors.length > 0) {
  console.error('❌ first-run-check FAILED — fix the ✗ items above, then re-run a session.');
  console.error('   To force re-check after fixing: rm .claude/.first-run-complete (or del on Windows)');
  console.error('');
  process.exit(0); // Exit 0 so session continues; user sees the errors
}

// Write marker
try {
  fs.mkdirSync(path.dirname(MARKER), { recursive: true });
  fs.writeFileSync(MARKER, JSON.stringify({ completed_at: new Date().toISOString(), warnings }, null, 2));
} catch {}

if (warnings.length > 0) {
  console.error(`✅ first-run-check passed (${warnings.length} warning${warnings.length === 1 ? '' : 's'} — non-blocking).`);
} else {
  console.error('✅ first-run-check passed — environment ready.');
}
console.error('');
process.exit(0);
