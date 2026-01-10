@echo off

echo Building Django + React application...

REM Build React
echo Step 1: Building React frontend...
cd ..\photoshare-frontend
call npm install
call npm run build

REM Copy React build to Django
echo Step 2: Copying React build to Django...
xcopy /E /I /Y build ..\photoshare_backend\static\

REM Install Python dependencies
echo Step 3: Installing Python dependencies...
cd ..\photoshare_backend
python -m pip install --upgrade pip
pip install -r requirements.txt

echo Build completed successfully!
