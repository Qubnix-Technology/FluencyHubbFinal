@echo off
title FluencyHub Backend + Live WebSocket Server
cd /d "%~dp0"
where php >nul 2>&1
if errorlevel 1 (
    set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe;%PATH%"
)

echo =========================================================
echo  Starting FluencyHub Services
echo  1. PHP HTTP API Server:       http://127.0.0.1:8000
echo  2. Pure PHP WebSocket Server: ws://127.0.0.1:8085
echo =========================================================

:: Launch WebSocket server in background window
start "FluencyHub WebSocket Server" /min php chat\websocket_server.php

:: Launch main HTTP API
php -S 127.0.0.1:8000
pause
