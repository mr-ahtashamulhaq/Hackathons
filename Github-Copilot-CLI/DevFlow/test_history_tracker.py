"""
Quick test for upgraded HistoryTracker
"""

import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

print("Testing HistoryTracker...")
print("=" * 60)

try:
    from src.history import HistoryTracker
    
    # Test initialization
    print("1. Initializing HistoryTracker...")
    tracker = HistoryTracker()
    print(f"   ✓ Initialized")
    print(f"   - Shell: {tracker.shell_type}")
    print(f"   - Path: {tracker.history_path}")
    
    # Test parse
    print("\n2. Parsing history...")
    commands = tracker.parse_shell_history()
    print(f"   ✓ Found {len(commands)} commands")
    
    if commands:
        # Test top commands
        print("\n3. Getting top commands...")
        top = tracker.get_top_commands(limit=3)
        print(f"   ✓ Top 3:")
        for i, cmd in enumerate(top, 1):
            print(f"      {i}. {cmd['command'][:40]}... ({cmd['count']} times)")
        
        # Test sequences
        print("\n4. Finding sequences...")
        seqs = tracker.find_common_sequences(sequence_length=2, min_frequency=2)
        print(f"   ✓ Found {len(seqs)} sequences")
        
        # Test aliases
        print("\n5. Suggesting aliases...")
        aliases = tracker.suggest_aliases(min_frequency=2, limit=3)
        print(f"   ✓ {len(aliases)} suggestions")
        for alias in aliases:
            print(f"      - {alias['alias']}: {alias['command'][:30]}...")
        
        # Test patterns
        print("\n6. Detecting workflow patterns...")
        patterns = tracker.detect_workflow_patterns()
        print(f"   ✓ Insights: {len(patterns['insights'])}")
    
    print("\n" + "=" * 60)
    print("✅ HistoryTracker is working!")
    print("=" * 60)

except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
