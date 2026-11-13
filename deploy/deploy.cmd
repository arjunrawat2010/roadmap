@echo off
rem Double-click or run from a terminal: deploy\deploy.cmd [stop] [-Port 9000]
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
if errorlevel 1 pause
