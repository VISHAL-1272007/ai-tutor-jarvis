# AI Tutor JARVIS - Deployment Script for Azure
# Run this from the ai-tutor directory

param(
    [string]$ResourceGroup = "ai-tutor-rg",
    [string]$Location = "eastus",
    [string]$AppName = "ai-tutor-jarvis",
    [string]$PlanName = "ai-tutor-plan"
)

Write-Host "🚀 Starting Azure Deployment for AI Tutor JARVIS" -ForegroundColor Cyan

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure CLI not found. Installing..." -ForegroundColor Red
    winget install Microsoft.AzureCLI
    Write-Host "✅ Azure CLI installed. Please restart PowerShell and run this script again." -ForegroundColor Green
    exit
}

# Login to Azure
Write-Host "`n🔐 Logging in to Azure..." -ForegroundColor Yellow
az login

# Create Resource Group
Write-Host "`n📦 Creating Resource Group: $ResourceGroup" -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# Create App Service Plan
Write-Host "`n⚙️ Creating App Service Plan: $PlanName" -ForegroundColor Yellow
az appservice plan create `
    --name $PlanName `
    --resource-group $ResourceGroup `
    --sku B1 `
    --is-linux

# Create Web App
Write-Host "`n🌐 Creating Web App: $AppName" -ForegroundColor Yellow
az webapp create `
    --resource-group $ResourceGroup `
    --plan $PlanName `
    --name $AppName `
    --runtime "NODE|20-lts"

# Prompt for environment variables
Write-Host "`n🔑 Setting up environment variables..." -ForegroundColor Yellow
$groqKey = Read-Host "Enter your GROQ_API_KEY"
$googleClientId = Read-Host "Enter your GOOGLE_CLIENT_ID"
$googleClientSecret = Read-Host "Enter your GOOGLE_CLIENT_SECRET" -AsSecureString
$googleClientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($googleClientSecret))
$sessionSecret = Read-Host "Enter your SESSION_SECRET (or press Enter for auto-generated)"

if ([string]::IsNullOrWhiteSpace($sessionSecret)) {
    $sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "✅ Generated SESSION_SECRET: $sessionSecret" -ForegroundColor Green
}

# Configure App Settings
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings `
        GROQ_API_KEY="$groqKey" `
        GOOGLE_CLIENT_ID="$googleClientId" `
        GOOGLE_CLIENT_SECRET="$googleClientSecretPlain" `
        SESSION_SECRET="$sessionSecret" `
        PORT="8080" `
        NODE_ENV="production"

# Configure startup command
Write-Host "`n⚙️ Configuring startup command..." -ForegroundColor Yellow
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --startup-file "cd backend && npm install --production && node index.js"

# Create deployment package
Write-Host "`n📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deploy.zip") {
    Remove-Item "deploy.zip"
}

# Install production dependencies
Push-Location backend
npm install --production
Pop-Location

# Create zip
Compress-Archive -Path backend,frontend -DestinationPath deploy.zip -Force

# Deploy
Write-Host "`n🚀 Deploying to Azure..." -ForegroundColor Yellow
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $AppName `
    --src deploy.zip

# Get URL
$appUrl = "https://$AppName.azurewebsites.net"
Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: $appUrl" -ForegroundColor Cyan
Write-Host "`n⚠️ IMPORTANT: Update Google OAuth callback URL to:" -ForegroundColor Yellow
Write-Host "   $appUrl/auth/google/callback" -ForegroundColor White

# Cleanup
Remove-Item deploy.zip -ErrorAction SilentlyContinue

Write-Host "`n🎉 All done! Visit your app at $appUrl" -ForegroundColor Green
