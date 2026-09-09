@echo off
echo Starting FluencyHubb Backend and Frontend...
where php >nul 2>&1
if errorlevel 1 (
    set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe;%PATH%"
)

start "FluencyHubb Backend API" cmd /k "cd /d "%~dp0backend" && php -S 127.0.0.1:8000"
start "FluencyHubb Frontend" cmd /k "cd /d "%~dp0EducationFrontend" && npm run dev"

echo Both services started in separate terminal windows.
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000
