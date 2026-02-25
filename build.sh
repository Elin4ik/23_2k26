#!/usr/bin/env bash
set -e

# Install Node dependencies and build frontend
npm install
npm run build

# Install Python dependencies
pip install -r backend/requirements.txt
