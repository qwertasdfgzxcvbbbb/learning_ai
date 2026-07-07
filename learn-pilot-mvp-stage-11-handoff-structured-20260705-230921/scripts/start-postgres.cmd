@echo off
setlocal

set "ROOT=%~dp0.."
set "LOCAL_TOOLS=%ROOT%\.tools"
set "SHARED_TOOLS=%~dp0..\..\.tools"

if exist "%LOCAL_TOOLS%\postgres-17.6\pgsql\bin\postgres.exe" (
  set "PG_TOOLS=%LOCAL_TOOLS%"
) else (
  set "PG_TOOLS=%SHARED_TOOLS%"
)

set "PG_BIN=%PG_TOOLS%\postgres-17.6\pgsql\bin"
set "PG_DATA=%PG_TOOLS%\postgres-data"

if not exist "%PG_BIN%\postgres.exe" (
  echo PostgreSQL binary not found: "%PG_BIN%\postgres.exe"
  echo Install portable PostgreSQL under "%PG_TOOLS%\postgres-17.6" first.
  exit /b 1
)

if not exist "%PG_DATA%\PG_VERSION" (
  echo Initializing local PostgreSQL data directory...
  "%PG_BIN%\initdb.exe" -D "%PG_DATA%" -U postgres -A trust --encoding=UTF8
  if errorlevel 1 exit /b %errorlevel%
)

echo Starting local PostgreSQL on port 5432...
echo Keep this window open while developing.
"%PG_BIN%\postgres.exe" -D "%PG_DATA%" -p 5432
