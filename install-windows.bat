@echo off
setlocal
set "SOURCE_DIR=%~dp0"
set "TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\SceneKeeper"

if not exist "%SOURCE_DIR%CSXS\manifest.xml" (
  echo SceneKeeper payload not found. Keep this installer in the SceneKeeper folder next to CSXS\manifest.xml.
  pause
  exit /b 1
)

for %%A in ("%SOURCE_DIR%.") do set "SOURCE_FULL=%%~fA"
for %%A in ("%TARGET_DIR%") do set "TARGET_FULL=%%~fA"
if /I "%SOURCE_FULL%"=="%TARGET_FULL%" (
  echo SceneKeeper is already in its install location.
  pause
  exit /b 0
)

echo Close After Effects before installing SceneKeeper.
choice /C YN /N /M "Continue? [Y/N] "
if errorlevel 2 exit /b 0

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if errorlevel 1 goto :failed
robocopy "%SOURCE_DIR%." "%TARGET_DIR%" /E /R:2 /W:1
if errorlevel 8 goto :failed

reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul
if errorlevel 1 goto :failed

echo.
echo SceneKeeper was installed and CEP extensions were enabled.
echo Restart After Effects, then open Window ^> Extensions (Legacy) ^> SceneKeeper.
pause
exit /b 0

:failed
echo.
echo Installation failed. Check your permissions and try again.
pause
exit /b 1
