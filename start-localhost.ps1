Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  FuelTrack - Doorstep Fuel Delivery and Operations Center" -ForegroundColor Yellow
Write-Host "  Starting Embedded Multi-Page Localhost Web Engine..." -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Launching default browser to: http://localhost:5000/login.html" -ForegroundColor Green

Start-Process "http://localhost:5000/login.html"
java -jar FuelTrackApp.jar
