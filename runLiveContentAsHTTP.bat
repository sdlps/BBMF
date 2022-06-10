@ECHO OFF
SET DIR=%~dp0%
CD %DIR%
ECHO %DIR%

java -cp LiveContentUtils.jar com.sdl.livecontentutils.runtime.RunAsHttpOrHttps HTTP

if errorlevel 1 goto ERRORING
echo.
echo Configuration changed, starting LiveContent...
echo.
@REM autoplay.exe
goto END

:ERRORING
echo.
echo ##############################################
echo An error occurred cannot start LiveContent ...
echo ##############################################
echo.
:END
PAUSE