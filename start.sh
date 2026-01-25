#!/bin/bash

echo "🚀 AI Checkout Demo - Quick Start"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit .env and add your GEMINI_API_KEY"
    echo "   Get your free key at: https://aistudio.google.com/app/apikey"
    echo ""
    echo "After adding your API key, run this script again."
    exit 1
fi

# Check if GEMINI_API_KEY is set
if grep -q "GEMINI_API_KEY=$" .env || grep -q "GEMINI_API_KEY=your" .env; then
    echo "⚠️  GEMINI_API_KEY not configured in .env file"
    echo ""
    echo "📝 Please edit .env and add your GEMINI_API_KEY"
    echo "   Get your free key at: https://aistudio.google.com/app/apikey"
    echo ""
    exit 1
fi

echo "✅ Environment configured"
echo "🎯 Starting development server..."
echo ""

npm run dev
