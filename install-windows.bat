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
if errorlevel 1 goto :folder_failed

set "COPY_LOG=%TEMP%\SceneKeeper-install-copy.log"
robocopy "%SOURCE_DIR%." "%TARGET_DIR%" /E /R:2 /W:1 /COPY:DAT /DCOPY:DAT /TEE /LOG:"%COPY_LOG%"
set "COPY_EXIT=%ERRORLEVEL%"
if %COPY_EXIT% GEQ 8 goto :copy_failed

reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f >nul
if errorlevel 1 goto :registry_failed

echo.
echo SceneKeeper was installed and CEP extensions were enabled.
echo Restart After Effects, then open Window ^> Extensions (Legacy) ^> SceneKeeper.
pause
exit /b 0

:folder_failed
echo.
echo SceneKeeper could not create the installation folder:
echo %TARGET_DIR%
echo Check that this Windows account can write to its AppData folder.
pause
exit /b 1

:copy_failed
echo.
echo SceneKeeper files could not be copied. Robocopy exit code: %COPY_EXIT%
echo Copy log: %COPY_LOG%
echo Check the log for the file or permission that caused the problem.
pause
exit /b %COPY_EXIT%

:registry_failed
echo.
echo SceneKeeper files were copied, but CEP could not be enabled automatically.
echo Open Command Prompt as this same Windows user and run:
echo reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
pause
exit /b 1
