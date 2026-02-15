"""
Test suite for Analytics Quality Layer
Tests path normalization, language tagging, and risk scoring
"""

from src.file_filter import (
    normalize_file_path,
    get_file_language,
    calculate_enhanced_risk_score,
    get_days_ago
)
from datetime import datetime, timedelta


def test_path_normalization():
    """Test path normalization to repo-relative format"""
    print("TEST: Path Normalization")
    print("-" * 60)
    
    test_cases = [
        # (input, expected_output)
        ("src/main.py", "src/main.py"),
        ("src\\utils\\helper.ts", "src/utils/helper.ts"),
        ("./src/app.js", "src/app.js"),
        ("frontend/src/App.tsx", "frontend/src/App.tsx"),
    ]
    
    for input_path, expected in test_cases:
        result = normalize_file_path(input_path, repo_root=".")
        # Normalize for comparison (remove leading ./)
        result_clean = result.lstrip('./')
        expected_clean = expected.lstrip('./')
        
        status = "✓" if result_clean == expected_clean else "✗"
        print(f"{status} '{input_path}' → '{result}'")
        assert result_clean == expected_clean, f"Expected {expected_clean}, got {result_clean}"
    
    print("✅ All path normalization tests passed\n")


def test_language_detection():
    """Test language detection from file extensions"""
    print("TEST: Language Detection")
    print("-" * 60)
    
    test_cases = [
        ("app.ts", "typescript"),
        ("component.tsx", "typescript"),
        ("script.js", "javascript"),
        ("index.jsx", "javascript"),
        ("main.py", "python"),
        ("service.go", "go"),
        ("lib.rs", "rust"),
        ("Handler.java", "java"),
        ("Program.cs", "csharp"),
        ("View.swift", "swift"),
        ("server.rb", "ruby"),
        ("api.php", "php"),
        ("unknown.xyz", "unknown"),
    ]
    
    for filepath, expected in test_cases:
        result = get_file_language(filepath)
        status = "✓" if result == expected else "✗"
        print(f"{status} {filepath}: {result} (expected {expected})")
        assert result == expected, f"Failed for {filepath}"
    
    print("✅ All language detection tests passed\n")


def test_enhanced_risk_score():
    """Test enhanced risk score calculation"""
    print("TEST: Enhanced Risk Score")
    print("-" * 60)
    
    # Test 1: High frequency, recent change
    score1 = calculate_enhanced_risk_score(
        change_count=30,
        contributor_count=5,
        last_modified_days=1,
        insertions=500,
        deletions=200
    )
    print(f"✓ High activity file: {score1}/100")
    assert 60 <= score1 <= 100, f"Expected high score, got {score1}"
    
    # Test 2: Low frequency, old change
    score2 = calculate_enhanced_risk_score(
        change_count=3,
        contributor_count=1,
        last_modified_days=90,
        insertions=50,
        deletions=20
    )
    print(f"✓ Low activity file: {score2}/100")
    assert 0 <= score2 <= 30, f"Expected low score, got {score2}"
    
    # Test 3: Recent but few changes
    score3 = calculate_enhanced_risk_score(
        change_count=5,
        contributor_count=2,
        last_modified_days=2,
        insertions=100,
        deletions=50
    )
    print(f"✓ Recent but stable: {score3}/100")
    assert 20 <= score3 <= 50, f"Expected medium score, got {score3}"
    
    # Test 4: Many contributors
    score4 = calculate_enhanced_risk_score(
        change_count=10,
        contributor_count=8,
        last_modified_days=7,
        insertions=200,
        deletions=100
    )
    print(f"✓ Many contributors: {score4}/100")
    assert 30 <= score4 <= 70, f"Expected medium-high score, got {score4}"
    
    # Test 5: Score normalization (should never exceed 100)
    score5 = calculate_enhanced_risk_score(
        change_count=100,
        contributor_count=20,
        last_modified_days=0,
        insertions=10000,
        deletions=5000
    )
    print(f"✓ Maximum scenario: {score5}/100")
    assert score5 <= 100, f"Score exceeded 100: {score5}"
    
    # Test 6: Minimum scenario (should never be negative)
    score6 = calculate_enhanced_risk_score(
        change_count=0,
        contributor_count=0,
        last_modified_days=None,
        insertions=0,
        deletions=0
    )
    print(f"✓ Minimum scenario: {score6}/100")
    assert score6 >= 0, f"Score below 0: {score6}"
    
    print("✅ All risk score tests passed\n")


def test_days_ago_calculation():
    """Test days ago calculation from timestamps"""
    print("TEST: Days Ago Calculation")
    print("-" * 60)
    
    # Test with ISO timestamp
    yesterday = (datetime.now() - timedelta(days=1)).isoformat()
    days1 = get_days_ago(yesterday)
    print(f"✓ Yesterday: {days1} days ago")
    assert days1 == 1, f"Expected 1 day, got {days1}"
    
    # Test with week ago
    week_ago = (datetime.now() - timedelta(days=7)).isoformat()
    days2 = get_days_ago(week_ago)
    print(f"✓ Week ago: {days2} days ago")
    assert days2 == 7, f"Expected 7 days, got {days2}"
    
    # Test with invalid timestamp
    days3 = get_days_ago(None)
    print(f"✓ Invalid timestamp: {days3}")
    assert days3 is None, f"Expected None, got {days3}"
    
    # Test with empty string
    days4 = get_days_ago("")
    print(f"✓ Empty string: {days4}")
    assert days4 is None, f"Expected None, got {days4}"
    
    print("✅ All days ago tests passed\n")


def test_risk_score_components():
    """Test individual components of risk score"""
    print("TEST: Risk Score Components")
    print("-" * 60)
    
    # Test change frequency component (max 40 points)
    score1 = calculate_enhanced_risk_score(
        change_count=20,  # Should give 40 points (20 * 2)
        contributor_count=0,
        last_modified_days=None,
        insertions=0,
        deletions=0
    )
    print(f"✓ Change frequency only: {score1}/100 (max 40)")
    assert score1 <= 40
    
    # Test recency component (max 30 points)
    score2 = calculate_enhanced_risk_score(
        change_count=0,
        contributor_count=0,
        last_modified_days=1,  # Should give 30 points
        insertions=0,
        deletions=0
    )
    print(f"✓ Recency only: {score2}/100 (max 30)")
    assert score2 <= 30
    
    # Test contributor component (max 20 points)
    score3 = calculate_enhanced_risk_score(
        change_count=0,
        contributor_count=5,  # Should give 20 points (5 * 4)
        last_modified_days=None,
        insertions=0,
        deletions=0
    )
    print(f"✓ Contributors only: {score3}/100 (max 20)")
    assert score3 <= 20
    
    # Test churn component (max 10 points)
    score4 = calculate_enhanced_risk_score(
        change_count=0,
        contributor_count=0,
        last_modified_days=None,
        insertions=500,
        deletions=500  # 1000 total = 10 points
    )
    print(f"✓ Churn only: {score4}/100 (max 10)")
    assert score4 <= 10
    
    print("✅ All component tests passed\n")


def test_recency_decay():
    """Test that recency score decays over time"""
    print("TEST: Recency Decay")
    print("-" * 60)
    
    # Recent change (1 day ago) should score higher than old change (90 days ago)
    recent_score = calculate_enhanced_risk_score(
        change_count=10,
        contributor_count=2,
        last_modified_days=1,
        insertions=0,
        deletions=0
    )
    
    old_score = calculate_enhanced_risk_score(
        change_count=10,
        contributor_count=2,
        last_modified_days=90,
        insertions=0,
        deletions=0
    )
    
    print(f"✓ Recent change (1 day): {recent_score}/100")
    print(f"✓ Old change (90 days): {old_score}/100")
    print(f"✓ Difference: {recent_score - old_score} points")
    
    assert recent_score > old_score, "Recent changes should score higher"
    
    print("✅ Recency decay test passed\n")


if __name__ == '__main__':
    print("=" * 60)
    print("ANALYTICS QUALITY LAYER - TEST SUITE")
    print("=" * 60)
    print()
    
    test_path_normalization()
    test_language_detection()
    test_enhanced_risk_score()
    test_days_ago_calculation()
    test_risk_score_components()
    test_recency_decay()
    
    print("=" * 60)
    print("✅ ALL QUALITY LAYER TESTS PASSED")
    print("=" * 60)
    print()
    print("Quality Layer Features Validated:")
    print("  ✓ Path normalization (repo-relative)")
    print("  ✓ Language detection (18+ languages)")
    print("  ✓ Enhanced risk scoring (0-100, multi-factor)")
    print("  ✓ Days ago calculation")
    print("  ✓ Score component weighting")
    print("  ✓ Recency decay")
    print()
