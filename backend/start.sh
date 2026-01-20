#!/bin/bash
# JARVIS AI Backend - Quick Start Script
# This script sets up and starts the Gemini backend in one command

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     🤖 JARVIS AI BACKEND - QUICK START 🤖               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo ""
    echo "Please create .env file with:"
    echo "  GEMINI_API_KEY=your_key_here"
    echo "  PORT=3000"
    echo ""
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Enter your Gemini API Key: " api_key
    
    if [ -z "$api_key" ]; then
        echo "❌ API key required!"
        exit 1
    fi
    
    echo "GEMINI_API_KEY=$api_key" > .env
    echo "PORT=3000" >> .env
    echo "✅ .env file created"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d node_modules ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed!"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting JARVIS AI Backend..."
echo ""

# Start the server
node server-gemini.js
