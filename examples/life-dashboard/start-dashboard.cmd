@echo off
rem Double-click to start the life dashboard. Keep this window open while you use it.
title Spike life dashboard
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from https://nodejs.org and then double-click this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo First run: installing the dashboard. This takes a minute or two...
  call npm install
  if errorlevel 1 (
    echo.
    echo The install failed. Copy the messages above and send them over.
    pause
    exit /b 1
  )
)

echo Starting the dashboard. Your browser will open at http://localhost:5173
echo Close this window to stop it.
set OPEN_BROWSER=1
call npm run dev
echo.
echo The dashboard stopped. If that was unexpected, copy the messages above and send them over.
pause
