@echo off
echo ========================================
echo Laboratory Management System - Installer
echo ========================================
echo.
echo Installing all dependencies...
echo.

echo [1/2] Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo [2/2] Installing frontend dependencies...
echo This may take 5-10 minutes...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Import database: mysql -u root -p ^< backend/config/schema.sql
echo 2. Configure backend/.env with your MySQL password
echo 3. Run start-backend.bat
echo 4. Run start-frontend.bat
echo 5. Open http://localhost:4200
echo.
pause
