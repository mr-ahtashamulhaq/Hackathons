#!/usr/bin/env python3
"""
DevFlow CLI runner script
Usage: python run.py [command] [options]
"""

import sys
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from src.cli import cli

if __name__ == '__main__':
    cli()
