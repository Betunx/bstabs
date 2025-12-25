#!/bin/bash
set -e

echo "Installing dependencies..."
cd frontend/black-sheep-app
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "Build completed successfully!"
