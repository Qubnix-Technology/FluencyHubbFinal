@echo off
title FluencyHub PHP WebSocket Demo Server
cd /d "%~dp0"
echo Starting Pure PHP WebSocket Server on ws://127.0.0.1:8085 ...
php websocket_demo_server.php
pause
