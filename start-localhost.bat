@echo off
title FuelTrack Localhost Launcher
cls
echo ============================================================================
echo   FuelTrack - Doorstep Fuel Delivery and Operations Center
echo   Starting Embedded Multi-Page Localhost Web Engine...
echo ============================================================================
echo   Launching default browser to: http://localhost:5000/login.html
start "" "http://localhost:5000/login.html"
java -jar FuelTrackApp.jar
pause
