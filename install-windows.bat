@echo off
setlocal
title SceneKeeper Installer
set "SOURCE_DIR=%~dp0"
set "TARGET_DIR=%APPDATA%\Adobe\CEP\extensions\SceneKeeper"

echo.
echo SceneKeeper Installer for Windows
echo ================================
echo.

if not exist "%SOURCE_DIR%CSXS\manifest.xml" (
  echo INSTALLATION STOPPED
  echo Installer files are incomplete. Extract the ZIP and run this file from its SceneKeeper folder.
  pause
  exit /b 1
)

for %%A in ("%SOURCE_DIR%.") do set "SOURCE_FULL=%%~fA"
for %%A in ("%TARGET_DIR%") do set "TARGET_FULL=%%~fA"
if /I "%SOURCE_FULL%"=="%TARGET_FULL%" (
  echo INSTALLATION STOPPED
  echo This installer is inside the installed SceneKeeper folder.
  echo Extract a fresh release ZIP and run the installer from there.
  pause
  exit /b 1
)

echo This installs or updates SceneKeeper for your Windows account.
echo Your saved clip library and panel settings are kept. No administrator access is needed.
echo.
echo Install location:
echo %TARGET_DIR%
echo.
echo Save your work and quit After Effects completely before continuing.
choice /C YN /M "Press Y to install or update SceneKeeper; press N to cancel"
if errorlevel 2 (
  echo.
  echo Installation canceled. No files were changed.
  pause
  exit /b 0
)

echo.
echo [1/3] Preparing the install folder...
if not exist "%TARGET_DIR%" (
  mkdir "%TARGET_DIR%"
  if errorlevel 1 goto :folder_failed
)

echo.
echo [2/3] Copying SceneKeeper files...
set "COPY_LOG=%TEMP%\SceneKeeper-install-copy.log"
xcopy "%SOURCE_DIR%*" "%TARGET_DIR%\" /E /Y /I /H /R > "%COPY_LOG%" 2>&1
set "COPY_EXIT=%ERRORLEVEL%"
if not "%COPY_EXIT%"=="0" goto :copy_failed

echo [3/3] Enabling CEP extensions...
reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul
if errorlevel 1 goto :registry_failed

echo.
echo INSTALLATION COMPLETE
echo 1. Start or restart After Effects.
echo 2. Open Window ^> Extensions (Legacy) ^> SceneKeeper.
pause
exit /b 0

:folder_failed
echo.
echo INSTALLATION STOPPED
echo SceneKeeper could not create the installation folder:
echo %TARGET_DIR%
echo Check that this Windows account can write to its AppData folder.
pause
exit /b 1

:copy_failed
echo.
echo INSTALLATION STOPPED
echo SceneKeeper files could not be copied. Xcopy exit code: %COPY_EXIT%
echo Copy log: %COPY_LOG%
echo Open the log to see which file or permission caused the problem.
pause
exit /b %COPY_EXIT%

:registry_failed
echo.
echo INSTALLATION PARTLY COMPLETE
echo SceneKeeper files were copied, but CEP could not be enabled automatically.
echo Open Command Prompt as this same Windows user and run:
echo.
echo reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
pause
exit /b 1
