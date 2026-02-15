"""
Test script to verify git analyzer fixes
"""

import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from src.git_analyzer import GitAnalyzer

def test_git_analyzer():
    print("=" * 70)
    print("TESTING GIT ANALYZER - Production Ready Edition")
    print("=" * 70)
    
    try:
        # Test 1: Initialize analyzer
        print("\n1. Initializing GitAnalyzer...")
        analyzer = GitAnalyzer('.')
        print(f"   ✓ Analyzer initialized")
        print(f"   - Empty repo: {analyzer.is_empty}")
        print(f"   - Default branch: {analyzer.default_branch}")
        print(f"   - Detached HEAD: {analyzer.is_detached}")
        
        # Test 2: Get repository stats
        print("\n2. Getting repository stats...")
        stats = analyzer.get_repository_stats()
        print(f"   ✓ Stats retrieved")
        print(f"   - Path: {stats.get('path')}")
        print(f"   - Total commits: {stats.get('total_commits', 0)}")
        print(f"   - Branches: {stats.get('total_branches', 0)}")
        
        # Test 3: Get commit history
        print("\n3. Getting commit history (30 days)...")
        commits = analyzer.get_commit_history(days=30)
        print(f"   ✓ Found {len(commits)} commits")
        
        if commits:
            print(f"   - Sample commit: {commits[0]['short_hash']} by {commits[0]['author']}")
            print(f"   - Message: {commits[0]['message'][:50]}...")
        
        # Test 4: Analyze patterns
        print("\n4. Analyzing commit patterns...")
        patterns = analyzer.analyze_commit_patterns(days=30)
        print(f"   ✓ Patterns analyzed")
        print(f"   - Total commits: {patterns['total_commits']}")
        print(f"   - Avg message length: {patterns['average_commit_message_length']}")
        print(f"   - Workday %: {patterns['workday_percentage']}")
        
        # Test 5: Get hotspot files
        print("\n5. Getting hotspot files...")
        hotspots = analyzer.get_hotspot_files(days=30, limit=5)
        print(f"   ✓ Found {len(hotspots)} hotspot files")
        
        if hotspots:
            for idx, (file, changes, lines) in enumerate(hotspots[:3], 1):
                print(f"   - {idx}. {file}: {changes} changes, {lines} lines")
        
        # Test 6: Calculate commit quality
        print("\n6. Testing commit quality scoring...")
        test_messages = [
            "feat: add new feature",
            "fix bug",
            "feat(auth): implement JWT authentication #123\n\nAdded comprehensive JWT support",
        ]
        for msg in test_messages:
            score = analyzer.calculate_commit_quality_score(msg)
            print(f"   - '{msg[:40]}...' -> Score: {score}/100")
        
        # Test 7: Generate productivity score
        print("\n7. Generating productivity score...")
        productivity = analyzer.generate_productivity_score(days=30)
        print(f"   ✓ Productivity score calculated")
        print(f"   - Score: {productivity['score']}/100 (Grade: {productivity['grade']})")
        print(f"   - Insights: {len(productivity['insights'])}")
        
        print("\n" + "=" * 70)
        print("✅ ALL TESTS PASSED!")
        print("=" * 70)
        print("\nReady to run: python run.py analyze")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_git_analyzer()
    sys.exit(0 if success else 1)
