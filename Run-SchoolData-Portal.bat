@echo off
title SchoolData Portal - One Click Run
color 0A
echo.
echo  ================================================
echo     SchoolData Portal - ONE CLICK RUN
echo  ================================================
echo.

cd /d "%~dp0agon-agent_2-d19a41bf (3)"

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo      Installing dependencies (first time only)...
    call npm run install:all
) else (
    echo      Dependencies already installed
)

echo.
echo [2/3] Starting Backend (MongoDB in-memory + Server)...
start "Backend Server" cmd /c "title Backend Server && cd /d "%~dp0agon-agent_2-d19a41bf (3)backend" && npm run dev:test"

echo.
echo [3/3] Starting Frontend (React + Vite)...
start "Frontend Server" cmd /c "title Frontend Server && cd /d "%~dp0agon-agent_2-d19a41bf (3)frontend" && npm run dev"

echo.
echo ================================================
echo.
echo  DONE! Opening browser in 5 seconds...
echo.
echo  App URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo  Test Credentials:
echo    Admin:     admin@school.edu / admin123
echo    Reviewer:  priya.reviewer@school.edu / reviewer123
echo    Teacher:   anita.teacher@school.edu / OTP: 123456
echo    Functionary: head.kv001@cbss.school.org / OTP: 123456
echo.
echo ================================================

timeout /t 5 /nobreak > nul
start http://localhost:5173

echo.
echo  Press any key to exit this window (servers will keep running)...
pause > nul
