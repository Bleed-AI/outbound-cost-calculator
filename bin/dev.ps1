<#
.SYNOPSIS
  Windows / PowerShell variant of bin/dev. Injects Doppler secrets, then runs the command.

.EXAMPLE
  bin\dev.ps1 node scripts/build-list.js
  bin\dev.ps1 pr-approve 42
  bin\dev.ps1 pr-list
#>

$ErrorActionPreference = 'Stop'
$ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ROOT

# Resolve doppler binary
$doppler = (Get-Command doppler -ErrorAction SilentlyContinue).Source
if (-not $doppler) {
  $candidates = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Doppler.doppler_Microsoft.Winget.Source_8wekyb3d8bbwe\doppler.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\doppler.exe"
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) { $doppler = $c; break }
  }
}
if (-not $doppler) {
  Write-Error "doppler CLI not found. Install: winget install doppler.doppler  ;  Auth: doppler login"
  exit 1
}

# Verify auth
$null = & $doppler whoami --silent 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Error "doppler not authenticated. Run: doppler login"
  exit 1
}

# Built-in subcommands
$first = $args[0]
$rest = if ($args.Count -gt 1) { $args[1..($args.Count - 1)] } else { @() }

switch ($first) {
  'pr-approve' {
    if (-not $rest[0]) { Write-Error "Usage: bin\dev.ps1 pr-approve N"; exit 1 }
    & gh pr merge $rest[0] --squash --delete-branch
    exit $LASTEXITCODE
  }
  'pr-reject' {
    if (-not $rest[0] -or -not $rest[1]) { Write-Error "Usage: bin\dev.ps1 pr-reject N `"reason`""; exit 1 }
    & gh pr close $rest[0] --comment $rest[1]
    exit $LASTEXITCODE
  }
  'pr-list' {
    & gh pr list --state open
    exit $LASTEXITCODE
  }
  'pr-review' {
    & node scripts/pr-review-hub.cjs
    exit $LASTEXITCODE
  }
  default {
    if (-not $first) {
      Write-Host ""
      Write-Host "Usage:  bin\dev.ps1 <command> [args...]" -ForegroundColor Cyan
      Write-Host ""
      Write-Host "Common patterns:"
      Write-Host "  bin\dev.ps1 node scripts/build-list.js          # run any node script with Doppler env injected"
      Write-Host "  bin\dev.ps1 node -e `"console.log(process.env.OPENAI_DEFAULT_MODEL)`"   # quick env check"
      Write-Host "  bin\dev.ps1 pr-list                              # list open PRs"
      Write-Host "  bin\dev.ps1 pr-review                            # walk pending PRs (writes pull-requests/)"
      Write-Host "  bin\dev.ps1 pr-approve N                         # approve + squash-merge PR #N"
      Write-Host "  bin\dev.ps1 pr-reject N `"reason`"                 # close PR #N with a reason"
      Write-Host ""
      Write-Host "Run from the repo root (campaign-master/). Doppler injects 22 secrets at runtime." -ForegroundColor DarkGray
      exit 1
    }
    # If only "node" was passed (no script/-e), warn — running plain `node` opens
    # a silent REPL that looks like nothing happened.
    if ($first -eq 'node' -and $rest.Count -eq 0) {
      Write-Host ""
      Write-Host "⚠  'bin\dev.ps1 node' alone would open a silent Node REPL." -ForegroundColor Yellow
      Write-Host "   You probably meant one of:" -ForegroundColor DarkGray
      Write-Host "     bin\dev.ps1 node scripts/<file>.cjs"
      Write-Host "     bin\dev.ps1 node -e `"console.log(process.env.OPENAI_DEFAULT_MODEL)`""
      Write-Host ""
      exit 1
    }
    & $doppler run --project bleedai --config prd_outbound-cost-calculator -- $args
    exit $LASTEXITCODE
  }
}
