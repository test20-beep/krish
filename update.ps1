param(
    [string]$SourcePath = ""
)

if ($SourcePath -eq "") {
    $SourcePath = Read-Host "Please enter the path to the new version folder"
}

if (-Not (Test-Path $SourcePath)) {
    Write-Host "Error: The path '$SourcePath' does not exist." -ForegroundColor Red
    exit 1
}

Write-Host "Syncing files from $SourcePath to current directory..." -ForegroundColor Cyan
robocopy $SourcePath . /MIR /XD .git node_modules /XF .env

# Robocopy exit codes < 8 are non-fatal
if ($LASTEXITCODE -ge 8) {
    Write-Host "Error during robocopy." -ForegroundColor Red
    exit 1
}

Write-Host "Files synced. Committing and pushing to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "Automated update from new version"
git push

Write-Host "Done! Your repository is updated." -ForegroundColor Green
