"""
Frontend Integration Test
Verifies insights.json schema matches frontend expectations
"""

import json
import os


def test_insights_schema():
    """Verify insights.json has correct schema for frontend"""
    print("TEST: Insights JSON Schema Validation")
    print("-" * 60)
    
    insights_path = "frontend/public/devflow-data/insights.json"
    
    assert os.path.exists(insights_path), f"insights.json not found at {insights_path}"
    print(f"✓ Found insights.json")
    
    with open(insights_path, 'r') as f:
        data = json.load(f)
    
    # Check top-level structure
    assert 'summary' in data, "Missing 'summary' field"
    assert 'insights' in data, "Missing 'insights' field"
    assert 'generated_at' in data, "Missing 'generated_at' field"
    print(f"✓ Top-level structure valid")
    
    # Check summary
    summary = data['summary']
    assert 'total' in summary
    assert 'by_severity' in summary
    assert 'by_type' in summary
    print(f"✓ Summary structure valid: {summary['total']} total insights")
    
    # Check insights array
    insights = data['insights']
    assert isinstance(insights, list), "insights should be array"
    assert len(insights) > 0, "No insights generated"
    print(f"✓ Insights array has {len(insights)} items")
    
    # Check each insight structure
    required_fields = ['type', 'severity', 'title', 'description', 'recommendation', 'timestamp']
    valid_types = ['risk', 'workflow', 'health', 'command']
    valid_severities = ['low', 'medium', 'high']
    
    for idx, insight in enumerate(insights):
        # Check all required fields exist
        for field in required_fields:
            assert field in insight, f"Insight {idx} missing field: {field}"
        
        # Validate type
        assert insight['type'] in valid_types, f"Invalid type: {insight['type']}"
        
        # Validate severity
        assert insight['severity'] in valid_severities, f"Invalid severity: {insight['severity']}"
        
        # Check types
        assert isinstance(insight['title'], str), "title must be string"
        assert isinstance(insight['description'], str), "description must be string"
        assert isinstance(insight['recommendation'], str), "recommendation must be string"
        assert isinstance(insight['timestamp'], str), "timestamp must be string"
        
        # Check not empty
        assert len(insight['title']) > 0, "title cannot be empty"
        assert len(insight['description']) > 0, "description cannot be empty"
        assert len(insight['recommendation']) > 0, "recommendation cannot be empty"
    
    print(f"✓ All {len(insights)} insights have valid structure")
    
    # Print sample insight
    print("\n📊 Sample Insight:")
    sample = insights[0]
    print(f"   Type: {sample['type']}")
    print(f"   Severity: {sample['severity']}")
    print(f"   Title: {sample['title']}")
    print(f"   Description: {sample['description'][:80]}...")
    print(f"   Recommendation: {sample['recommendation'][:80]}...")
    
    print("\n✅ Insights JSON schema validation passed\n")


def test_all_json_files_exist():
    """Verify all expected JSON files exist"""
    print("TEST: JSON Files Existence Check")
    print("-" * 60)
    
    base_path = "frontend/public/devflow-data"
    expected_files = [
        "productivity-summary.json",
        "file-hotspots.json",
        "commit-analytics.json",
        "command-usage.json",
        "insights.json"
    ]
    
    for filename in expected_files:
        path = os.path.join(base_path, filename)
        assert os.path.exists(path), f"Missing file: {filename}"
        
        # Verify it's valid JSON
        with open(path, 'r') as f:
            json.load(f)
        
        size = os.path.getsize(path)
        print(f"✓ {filename:30s} ({size:,} bytes)")
    
    print("\n✅ All JSON files exist and are valid\n")


def test_file_hotspots_schema():
    """Verify file-hotspots.json matches frontend FileRisk interface"""
    print("TEST: File Hotspots Schema Validation")
    print("-" * 60)
    
    path = "frontend/public/devflow-data/file-hotspots.json"
    
    with open(path, 'r') as f:
        data = json.load(f)
    
    assert 'fileRiskData' in data, "Missing fileRiskData field"
    
    files = data['fileRiskData']
    assert isinstance(files, list), "fileRiskData must be array"
    
    if len(files) == 0:
        print("⚠ No file risk data (repository may have no source files)")
        return
    
    # Check schema matches TypeScript interface
    required_fields = ['path', 'riskScore', 'changeCount', 'contributors', 'language', 'lastModifiedDaysAgo']
    
    for idx, file in enumerate(files):
        for field in required_fields:
            assert field in file, f"File {idx} missing field: {field}"
        
        # Type checks
        assert isinstance(file['path'], str)
        assert isinstance(file['riskScore'], (int, float))
        assert isinstance(file['changeCount'], int)
        assert isinstance(file['contributors'], int)
        assert isinstance(file['language'], str)
        assert isinstance(file['lastModifiedDaysAgo'], int)
        
        # Range checks
        assert 0 <= file['riskScore'] <= 100, f"riskScore out of range: {file['riskScore']}"
        assert file['changeCount'] >= 0
        assert file['contributors'] >= 0
    
    print(f"✓ All {len(files)} file entries have valid schema")
    
    # Show sample
    print("\n📊 Sample File Risk Entry:")
    sample = files[0]
    print(f"   Path: {sample['path']}")
    print(f"   Risk Score: {sample['riskScore']}")
    print(f"   Changes: {sample['changeCount']}")
    print(f"   Contributors: {sample['contributors']}")
    print(f"   Language: {sample['language']}")
    print(f"   Last Modified: {sample['lastModifiedDaysAgo']} days ago")
    
    print("\n✅ File hotspots schema validation passed\n")


if __name__ == '__main__':
    print("=" * 60)
    print("FRONTEND INTEGRATION TESTS")
    print("=" * 60)
    print()
    
    test_all_json_files_exist()
    test_file_hotspots_schema()
    test_insights_schema()
    
    print("=" * 60)
    print("✅ ALL FRONTEND INTEGRATION TESTS PASSED")
    print("=" * 60)
    print()
    print("Frontend is ready to consume exported JSON data!")
    print("Dev server should display:")
    print("  • Real repository data (not mock)")
    print("  • Actionable insights with severity levels")
    print("  • File risk intelligence with language tags")
    print("  • No console errors")
    print()
