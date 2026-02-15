"""
Quick test for history command
"""

import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

print("Testing history command...")
print("=" * 60)

try:
    # Test imports
    print("1. Testing imports...")
    from src.cli import cli
    from src.history import HistoryAnalyzer
    print("   ✓ Imports successful")
    
    # Test HistoryAnalyzer directly
    print("\n2. Testing HistoryAnalyzer...")
    analyzer = HistoryAnalyzer()
    commands = analyzer.parse_shell_history()
    print(f"   ✓ Found {len(commands)} commands in history")
    
    if commands:
        top = analyzer.get_top_commands(limit=3)
        print(f"   ✓ Top 3 commands analyzed")
        for idx, cmd_data in enumerate(top, 1):
            print(f"      {idx}. {cmd_data['command'][:40]}... ({cmd_data['count']} times)")
    
    print("\n3. CLI is ready to test!")
    print("   Run: python run.py history")
    print("   Run: python run.py history --suggest-aliases")
    
    print("\n✅ All tests passed!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
