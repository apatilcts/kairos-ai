#!/bin/bash
echo "Creating frontend environment file..."

cat > .env.local << 'ENVEOF'
# Frontend Environment Variables

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=AI-MVP Document Assistant
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
ENVEOF

echo "Frontend environment file created successfully!"
