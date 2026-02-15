"""
Source Code File Filter
Centralized file filtering for DevFlow analytics
"""

import os
from pathlib import Path
from datetime import datetime


# PHASE 1: Allowed source code extensions
ALLOWED_SOURCE_EXTENSIONS = {
    # TypeScript/JavaScript
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    
    # Python
    '.py', '.pyw',
    
    # Go
    '.go',
    
    # Rust
    '.rs',
    
    # Java/Kotlin
    '.java', '.kt', '.kts',
    
    # C/C++
    '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hxx',
    
    # C#
    '.cs',
    
    # Swift
    '.swift',
    
    # Ruby
    '.rb',
    
    # PHP
    '.php',
    
    # Scala
    '.scala',
    
    # Shell
    '.sh', '.bash', '.zsh',
    
    # Other compiled languages
    '.m', '.mm',  # Objective-C
    '.dart',
    '.lua',
    '.pl',  # Perl
    '.r',  # R
    '.sql',
    '.vim',
}

# JSON files only in src folders
CONDITIONAL_EXTENSIONS = {
    '.json': lambda path: 'src' in Path(path).parts or 'source' in Path(path).parts
}


# PHASE 2: Blocked extensions and filenames
BLOCKED_EXTENSIONS = {
    # Documentation
    '.md', '.mdx', '.rst', '.txt', '.pdf', '.doc', '.docx',
    
    # Lock files
    '.lock',
    
    # Logs
    '.log',
    
    # Data files
    '.csv', '.tsv', '.xml', '.html', '.htm',
    
    # Environment/Config text files
    '.env', '.env.example', '.env.local', '.env.production',
    
    # YAML/Config
    '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf',
    
    # Images/Assets
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    
    # Archives
    '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar',
    
    # Build artifacts
    '.pyc', '.pyo', '.class', '.o', '.so', '.dll', '.exe',
    '.jar', '.war', '.ear',
    
    # IDE files
    '.idea', '.vscode', '.suo', '.user',
    
    # Git
    '.gitignore', '.gitattributes', '.gitmodules',
    
    # Other
    '.DS_Store', '.npmignore',
}

BLOCKED_FILENAMES = {
    # Lock files
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'Gemfile.lock',
    'composer.lock',
    'Cargo.lock',
    'poetry.lock',
    'Pipfile.lock',
    
    # Config files
    'tsconfig.json',
    'jsconfig.json',
    'babel.config.json',
    'webpack.config.js',
    'vite.config.js',
    'vite.config.ts',
    'rollup.config.js',
    'jest.config.js',
    'vitest.config.ts',
    '.eslintrc.json',
    '.prettierrc',
    '.editorconfig',
    
    # Other
    'LICENSE',
    'README',
    'README.md',
    'CHANGELOG',
    'CHANGELOG.md',
    'AUTHORS',
    'CONTRIBUTING.md',
}


# PHASE 3: Filter function
def is_source_code_file(filepath: str) -> bool:
    """
    Determine if a file is source code that should be analyzed
    
    Args:
        filepath (str): File path to check
        
    Returns:
        bool: True if file should be included in analytics
    """
    if not filepath:
        return False
    
    path = Path(filepath)
    filename = path.name.lower()
    ext = path.suffix.lower()
    
    # Check blocked filenames first (exact match)
    if filename in BLOCKED_FILENAMES or path.name in BLOCKED_FILENAMES:
        return False
    
    # Check blocked extensions
    if ext in BLOCKED_EXTENSIONS:
        return False
    
    # Check if it's a hidden file (starts with .)
    if filename.startswith('.') and ext not in ALLOWED_SOURCE_EXTENSIONS:
        return False
    
    # Check allowed extensions
    if ext in ALLOWED_SOURCE_EXTENSIONS:
        return True
    
    # Check conditional extensions
    if ext in CONDITIONAL_EXTENSIONS:
        return CONDITIONAL_EXTENSIONS[ext](filepath)
    
    # Default: exclude
    return False


def filter_source_files(file_list: list) -> list:
    """
    Filter a list of file paths to only include source code
    
    Args:
        file_list (list): List of file paths (strings or tuples)
        
    Returns:
        list: Filtered list containing only source code files
    """
    filtered = []
    
    for item in file_list:
        # Handle tuples (filepath, data...)
        if isinstance(item, tuple):
            filepath = item[0]
            if is_source_code_file(filepath):
                filtered.append(item)
        # Handle dicts
        elif isinstance(item, dict):
            filepath = item.get('file') or item.get('path') or item.get('filepath')
            if filepath and is_source_code_file(filepath):
                filtered.append(item)
        # Handle strings
        elif isinstance(item, str):
            if is_source_code_file(item):
                filtered.append(item)
    
    return filtered


def get_file_stats():
    """Get statistics about filtering configuration"""
    return {
        'allowed_extensions': len(ALLOWED_SOURCE_EXTENSIONS),
        'blocked_extensions': len(BLOCKED_EXTENSIONS),
        'blocked_filenames': len(BLOCKED_FILENAMES),
    }


# PART 2: FILE PATH NORMALIZATION

def normalize_file_path(filepath: str, repo_root: str = None) -> str:
    """
    Normalize file path to repo-relative format
    
    Converts absolute OS paths to repository-relative paths
    Example: C:/repo/src/auth/login.ts -> src/auth/login.ts
    
    Args:
        filepath (str): File path (absolute or relative)
        repo_root (str): Repository root path (optional, auto-detected if None)
        
    Returns:
        str: Normalized repo-relative path with forward slashes
    """
    if not filepath:
        return filepath
    
    # Convert to Path object
    path = Path(filepath)
    
    # If repo_root not provided, try to detect it
    if repo_root is None:
        try:
            import git
            repo = git.Repo(os.getcwd(), search_parent_directories=True)
            repo_root = repo.working_dir
        except:
            # Fallback: use current directory
            repo_root = os.getcwd()
    
    repo_root_path = Path(repo_root).resolve()
    
    # Try to make path relative to repo root
    try:
        # If path is absolute, make it relative
        if path.is_absolute():
            rel_path = path.relative_to(repo_root_path)
        else:
            rel_path = path
        
        # Convert to forward slashes (Unix style)
        normalized = str(rel_path).replace('\\', '/')
        return normalized
        
    except ValueError:
        # Path is not relative to repo_root, return as-is with forward slashes
        return str(path).replace('\\', '/')


# PART 3: LANGUAGE TAGGING

EXTENSION_TO_LANGUAGE = {
    # TypeScript/JavaScript
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    
    # Python
    '.py': 'python',
    '.pyw': 'python',
    
    # Go
    '.go': 'go',
    
    # Rust
    '.rs': 'rust',
    
    # Java/Kotlin
    '.java': 'java',
    '.kt': 'kotlin',
    '.kts': 'kotlin',
    
    # C/C++
    '.c': 'c',
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.cxx': 'cpp',
    '.h': 'c',
    '.hpp': 'cpp',
    '.hxx': 'cpp',
    
    # C#
    '.cs': 'csharp',
    
    # Swift
    '.swift': 'swift',
    
    # Ruby
    '.rb': 'ruby',
    
    # PHP
    '.php': 'php',
    
    # Scala
    '.scala': 'scala',
    
    # Shell
    '.sh': 'shell',
    '.bash': 'shell',
    '.zsh': 'shell',
    
    # Other
    '.m': 'objective-c',
    '.mm': 'objective-c',
    '.dart': 'dart',
    '.lua': 'lua',
    '.pl': 'perl',
    '.r': 'r',
    '.sql': 'sql',
    '.vim': 'vim',
    '.json': 'json',
}


def get_file_language(filepath: str) -> str:
    """
    Determine programming language from file extension
    
    Args:
        filepath (str): File path
        
    Returns:
        str: Language name (e.g. 'python', 'typescript') or 'unknown'
    """
    if not filepath:
        return 'unknown'
    
    ext = Path(filepath).suffix.lower()
    return EXTENSION_TO_LANGUAGE.get(ext, 'unknown')


# PART 4: RISK SCORE IMPROVEMENT

def calculate_enhanced_risk_score(
    change_count: int,
    contributor_count: int,
    last_modified_days: int = None,
    insertions: int = 0,
    deletions: int = 0
) -> int:
    """
    Calculate enhanced risk score (0-100)
    
    Formula combines:
    - Change frequency weight (40%)
    - Recent change boost (30%)
    - Contributor count weight (20%)
    - Code churn weight (10%)
    
    Args:
        change_count (int): Number of times file changed
        contributor_count (int): Number of unique contributors
        last_modified_days (int): Days since last modification
        insertions (int): Total lines inserted
        deletions (int): Total lines deleted
        
    Returns:
        int: Risk score 0-100
    """
    # Change frequency component (0-40 points)
    # More changes = higher risk
    change_score = min(40, change_count * 2)
    
    # Recent change boost (0-30 points)
    # Files changed in last 7 days get higher risk
    recency_score = 0
    if last_modified_days is not None:
        if last_modified_days <= 1:
            recency_score = 30  # Changed today/yesterday
        elif last_modified_days <= 7:
            recency_score = 20  # Changed this week
        elif last_modified_days <= 30:
            recency_score = 10  # Changed this month
        else:
            recency_score = 5   # Changed longer ago
    
    # Contributor count component (0-20 points)
    # More contributors = potential for conflicts
    contributor_score = min(20, contributor_count * 4)
    
    # Code churn component (0-10 points)
    # High churn indicates instability
    total_churn = insertions + deletions
    churn_score = min(10, total_churn // 100)
    
    # Combine scores
    total_score = change_score + recency_score + contributor_score + churn_score
    
    # Normalize to 0-100
    return min(100, max(0, int(total_score)))


def get_days_ago(timestamp: str) -> int:
    """
    Calculate days ago from ISO timestamp
    
    Args:
        timestamp (str): ISO format timestamp
        
    Returns:
        int: Number of days ago (or None if invalid)
    """
    if not timestamp:
        return None
    
    try:
        if isinstance(timestamp, str):
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        else:
            dt = timestamp
        
        now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
        delta = now - dt
        return delta.days
    except:
        return None
