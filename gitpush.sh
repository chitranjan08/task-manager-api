#!/bin/bash

# Ask for a commit message
read -p "Enter commit message: " msg

echo "📂 Adding all changes..."
git add .

echo "📝 Committing with message: $msg"
git commit -m "$msg"

echo "🚀 Pushing to origin main..."
git push origin main

echo "✅ Done!"
