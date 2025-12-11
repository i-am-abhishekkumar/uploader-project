#!/bin/bash

# Node.js Installation Helper Script for macOS
# This script helps install Node.js using Homebrew

echo "========================================="
echo "Node.js Installation Helper"
echo "========================================="
echo ""

# Check if Homebrew is installed
if command -v brew &> /dev/null; then
    echo "✓ Homebrew is installed"
    echo ""
    echo "Installing Node.js via Homebrew..."
    brew install node
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "========================================="
        echo "✓ Node.js installed successfully!"
        echo "========================================="
        echo ""
        echo "Please restart your terminal and run:"
        echo "  node --version"
        echo "  npm --version"
    else
        echo ""
        echo "Installation failed. Please try manual installation."
    fi
else
    echo "Homebrew is not installed."
    echo ""
    echo "Would you like to install Homebrew first? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        echo ""
        echo "After Homebrew installation completes, run this script again:"
        echo "  bash install-node.sh"
    else
        echo ""
        echo "Please install Node.js manually:"
        echo "1. Visit https://nodejs.org/"
        echo "2. Download the LTS version for macOS"
        echo "3. Run the installer"
        echo "4. Restart your terminal"
    fi
fi

