"""
Test suite for source code file filter
"""

from src.file_filter import (
    is_source_code_file,
    filter_source_files,
    ALLOWED_SOURCE_EXTENSIONS,
    BLOCKED_EXTENSIONS,
    BLOCKED_FILENAMES
)


def test_allowed_extensions():
    """Test that allowed source code extensions are accepted"""
    test_cases = [
        ('src/main.py', True),
        ('app.js', True),
        ('Component.tsx', True),
        ('utils.ts', True),
        ('Handler.java', True),
        ('service.go', True),
        ('lib.rs', True),
        ('main.cpp', True),
        ('Program.cs', True),
        ('View.swift', True),
    ]
    
    for filepath, expected in test_cases:
        result = is_source_code_file(filepath)
        status = "✓" if result == expected else "✗"
        print(f"{status} {filepath}: {result} (expected {expected})")
        assert result == expected, f"Failed for {filepath}"


def test_blocked_extensions():
    """Test that blocked extensions are rejected"""
    test_cases = [
        ('README.md', False),
        ('config.yml', False),
        ('data.csv', False),
        ('.env', False),
        ('notes.txt', False),
        ('archive.log', False),
        ('package-lock.json', False),
        ('.gitignore', False),
    ]
    
    for filepath, expected in test_cases:
        result = is_source_code_file(filepath)
        status = "✓" if result == expected else "✗"
        print(f"{status} {filepath}: {result} (expected {expected})")
        assert result == expected, f"Failed for {filepath}"


def test_blocked_filenames():
    """Test that specific blocked filenames are rejected"""
    test_cases = [
        ('package-lock.json', False),
        ('yarn.lock', False),
        ('Cargo.lock', False),
        ('README.md', False),
        ('LICENSE', False),
        ('tsconfig.json', False),
        ('webpack.config.js', False),
    ]
    
    for filepath, expected in test_cases:
        result = is_source_code_file(filepath)
        status = "✓" if result == expected else "✗"
        print(f"{status} {filepath}: {result} (expected {expected})")
        assert result == expected, f"Failed for {filepath}"


def test_json_in_src():
    """Test that JSON files in src/ are allowed"""
    test_cases = [
        ('src/data.json', True),
        ('src/config/settings.json', True),
        ('package.json', False),  # Not in src/
        ('config.json', False),  # Not in src/
    ]
    
    for filepath, expected in test_cases:
        result = is_source_code_file(filepath)
        status = "✓" if result == expected else "✗"
        print(f"{status} {filepath}: {result} (expected {expected})")
        assert result == expected, f"Failed for {filepath}"


def test_filter_source_files():
    """Test filtering a list of files"""
    file_list = [
        ('src/main.py', 10, 100),  # Tuple format
        ('README.md', 5, 50),
        ('app.js', 8, 80),
        ('.gitignore', 2, 20),
        ('lib.rs', 6, 60),
    ]
    
    filtered = filter_source_files(file_list)
    assert len(filtered) == 3, f"Expected 3 files, got {len(filtered)}"
    
    # Extract filenames
    filenames = [f[0] for f in filtered]
    assert 'src/main.py' in filenames
    assert 'app.js' in filenames
    assert 'lib.rs' in filenames
    assert 'README.md' not in filenames
    assert '.gitignore' not in filenames
    
    print(f"✓ Filtered {len(file_list)} files down to {len(filtered)} source files")


def test_filter_dict_format():
    """Test filtering dict format (as used in database)"""
    file_list = [
        {'file': 'src/main.py', 'changes': 10},
        {'file': 'README.md', 'changes': 5},
        {'file': 'app.js', 'changes': 8},
    ]
    
    filtered = filter_source_files(file_list)
    assert len(filtered) == 2, f"Expected 2 files, got {len(filtered)}"
    
    filenames = [f['file'] for f in filtered]
    assert 'src/main.py' in filenames
    assert 'app.js' in filenames
    assert 'README.md' not in filenames
    
    print(f"✓ Filtered dict format: {len(file_list)} → {len(filtered)}")


def test_edge_cases():
    """Test edge cases"""
    test_cases = [
        ('', False),  # Empty string
        ('.hidden', False),  # Hidden file without extension
        ('file_without_ext', False),  # No extension
        ('dir/.gitkeep', False),  # Git keep file
        ('BUILD', False),  # Build file
    ]
    
    for filepath, expected in test_cases:
        result = is_source_code_file(filepath)
        status = "✓" if result == expected else "✗"
        print(f"{status} '{filepath}': {result} (expected {expected})")
        assert result == expected, f"Failed for '{filepath}'"


if __name__ == '__main__':
    print("=" * 60)
    print("SOURCE CODE FILE FILTER - TEST SUITE")
    print("=" * 60)
    print()
    
    print("TEST 1: Allowed Source Extensions")
    print("-" * 60)
    test_allowed_extensions()
    print()
    
    print("TEST 2: Blocked Extensions")
    print("-" * 60)
    test_blocked_extensions()
    print()
    
    print("TEST 3: Blocked Filenames")
    print("-" * 60)
    test_blocked_filenames()
    print()
    
    print("TEST 4: JSON in src/ folders")
    print("-" * 60)
    test_json_in_src()
    print()
    
    print("TEST 5: Filter List (Tuple Format)")
    print("-" * 60)
    test_filter_source_files()
    print()
    
    print("TEST 6: Filter List (Dict Format)")
    print("-" * 60)
    test_filter_dict_format()
    print()
    
    print("TEST 7: Edge Cases")
    print("-" * 60)
    test_edge_cases()
    print()
    
    print("=" * 60)
    print("✅ ALL TESTS PASSED")
    print("=" * 60)
    print()
    print(f"Filter Configuration:")
    print(f"  • Allowed extensions: {len(ALLOWED_SOURCE_EXTENSIONS)}")
    print(f"  • Blocked extensions: {len(BLOCKED_EXTENSIONS)}")
    print(f"  • Blocked filenames: {len(BLOCKED_FILENAMES)}")
