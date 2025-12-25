#!/bin/bash
set -e

echo "Installing dependencies..."
cd frontend/black-sheep-app
npm ci --legacy-peer-deps

echo "Building application..."
npm run build

echo "Build completed successfully!"
