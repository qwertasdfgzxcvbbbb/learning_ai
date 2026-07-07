@echo off
setlocal

set "ROOT=%~dp0.."
set "LOCAL_NODE_DIR=%ROOT%\.tools\node-v22.23.1-win-x64-install\node-v22.23.1-win-x64"
set "SHARED_NODE_DIR=%~dp0..\..\.tools\node-v22.23.1-win-x64-install\node-v22.23.1-win-x64"

if exist "%LOCAL_NODE_DIR%\npm.cmd" (
  set "NODE_DIR=%LOCAL_NODE_DIR%"
  set "PATH=%NODE_DIR%;%PATH%"
  set "NPM=%NODE_DIR%\npm.cmd"
) else if exist "%SHARED_NODE_DIR%\npm.cmd" (
  set "NODE_DIR=%SHARED_NODE_DIR%"
  set "PATH=%NODE_DIR%;%PATH%"
  set "NPM=%NODE_DIR%\npm.cmd"
) else (
  for %%I in (npm.cmd) do set "NPM=%%~$PATH:I"
)

if not defined NPM (
  echo npm.cmd not found. Install Node.js or add npm.cmd to PATH.
  exit /b 1
)

if exist "%ROOT%\.next" (
  echo Clearing Next.js dev cache...
  rmdir /s /q "%ROOT%\.next"
)

call "%NPM%" run dev -- --hostname 127.0.0.1 --port 3000
