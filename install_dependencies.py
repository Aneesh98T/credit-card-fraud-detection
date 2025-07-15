#!/usr/bin/env python3
"""
Dependency Installation Script for Credit Card Fraud Detection System
This script helps install all required Python packages for the credit card fraud detection backend.
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def upgrade_pip():
    """Upgrade pip to latest version"""
    return run_command(
        f"{sys.executable} -m pip install --upgrade pip",
        "Upgrading pip"
    )

def install_requirements():
    """Install requirements from requirements.txt"""
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    requirements_file = os.path.join(backend_dir, 'requirements.txt')
    
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file not found: {requirements_file}")
        return False
    
    return run_command(
        f"{sys.executable} -m pip install -r {requirements_file}",
        "Installing Python dependencies"
    )



def main():
    """Main installation process"""
    print("🚀 Credit Card Fraud Detection - Dependency Installation")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Upgrade pip
    if not upgrade_pip():
        print("\n⚠️  Pip upgrade failed, but continuing...")
    
    # Install requirements
    if not install_requirements():
        print("\n❌ Installation failed. Please check the errors above.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 Installation completed!")
    print("\nNext steps:")
    print("1. Start the backend: cd backend && python app.py")
    print("2. Start the frontend: cd frontend && npm start")
    print("3. Open http://localhost:3000 in your browser")

if __name__ == "__main__":
    main() 