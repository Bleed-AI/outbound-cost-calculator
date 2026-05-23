@echo off
REM Cross-shell wrapper around bin\dev.ps1.
REM Lets users type `bin\dev ...` from CMD, PowerShell, or Git Bash
REM without worrying about .ps1 file associations or .\ prefix rules.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev.ps1" %*
exit /b %ERRORLEVEL%
