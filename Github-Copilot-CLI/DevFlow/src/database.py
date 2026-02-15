"""
Database module for storing and retrieving git analysis data
"""

import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path
from contextlib import contextmanager


class Database:
    """SQLite database manager for DevFlow"""
    
    def __init__(self, db_path=None):
        """
        Initialize database connection
        
        Args:
            db_path (str): Path to SQLite database file
        """
        if db_path is None:
            config_dir = Path.home() / '.devflow'
            config_dir.mkdir(exist_ok=True)
            db_path = config_dir / 'devflow.db'
        
        self.db_path = db_path
        self._init_database()
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def _init_database(self):
        """Initialize database schema"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Commits table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS commits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sha TEXT UNIQUE NOT NULL,
                    short_sha TEXT NOT NULL,
                    author TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    commit_date TIMESTAMP NOT NULL,
                    files_changed INTEGER DEFAULT 0,
                    insertions INTEGER DEFAULT 0,
                    deletions INTEGER DEFAULT 0,
                    quality_score REAL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # File hotspots table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS file_hotspots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_path TEXT NOT NULL,
                    change_count INTEGER DEFAULT 0,
                    total_insertions INTEGER DEFAULT 0,
                    total_deletions INTEGER DEFAULT 0,
                    last_modified TIMESTAMP,
                    risk_level TEXT,
                    unique_authors INTEGER DEFAULT 0,
                    authors TEXT,
                    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    days_analyzed INTEGER DEFAULT 30
                )
            ''')
            
            # Commit patterns table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS commit_patterns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pattern_type TEXT NOT NULL,
                    pattern_key TEXT NOT NULL,
                    pattern_value INTEGER DEFAULT 0,
                    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    days_analyzed INTEGER DEFAULT 30
                )
            ''')
            
            # Create indices for performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_commits_date 
                ON commits(commit_date)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_commits_author 
                ON commits(author)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_hotspots_file 
                ON file_hotspots(file_path)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_hotspots_changes 
                ON file_hotspots(change_count)
            ''')
    
    def save_commit_analysis(self, commit_data):
        """
        Store commit analysis results (supports batch)
        
        Args:
            commit_data (dict or list): Single commit or list of commits
            
        Returns:
            int: Number of commits saved
        """
        if isinstance(commit_data, dict):
            commit_data = [commit_data]
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            saved_count = 0
            
            for commit in commit_data:
                try:
                    # Handle both 'sha' and 'hash' keys
                    commit_hash = commit.get('hash') or commit.get('sha')
                    short_hash = commit.get('short_hash') or commit.get('short_sha')
                    commit_date = commit.get('timestamp') or commit.get('date')
                    
                    # Convert datetime to ISO string if needed
                    if hasattr(commit_date, 'isoformat'):
                        commit_date = commit_date.isoformat()
                    
                    cursor.execute('''
                        INSERT OR REPLACE INTO commits 
                        (sha, short_sha, author, email, message, commit_date, 
                         files_changed, insertions, deletions, quality_score)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        commit_hash,
                        short_hash,
                        commit.get('author'),
                        commit.get('email'),
                        commit.get('message'),
                        commit_date,
                        commit.get('files_changed', 0),
                        commit.get('insertions', 0),
                        commit.get('deletions', 0),
                        commit.get('quality_score', 0)
                    ))
                    saved_count += 1
                except sqlite3.IntegrityError:
                    # Skip duplicate commits
                    pass
                except Exception:
                    # Skip commits that fail to save
                    pass
            
            return saved_count
    
    # Alias for batch operations
    def save_commit_batch(self, commit_data):
        """Batch save commits (alias for save_commit_analysis)"""
        return self.save_commit_analysis(commit_data)
    
    def get_commit_stats(self, days=30, author=None):
        """
        Retrieve aggregated commit statistics
        
        Args:
            days (int): Number of days to look back
            author (str): Filter by author name (optional)
            
        Returns:
            dict: Aggregated statistics
        """
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Build query with optional author filter
            query = '''
                SELECT 
                    COUNT(*) as total_commits,
                    COUNT(DISTINCT author) as unique_authors,
                    SUM(files_changed) as total_files_changed,
                    SUM(insertions) as total_insertions,
                    SUM(deletions) as total_deletions,
                    AVG(quality_score) as avg_quality_score,
                    MIN(commit_date) as earliest_commit,
                    MAX(commit_date) as latest_commit
                FROM commits
                WHERE commit_date >= ?
            '''
            
            params = [since_date]
            
            if author:
                query += ' AND author LIKE ?'
                params.append(f'%{author}%')
            
            cursor.execute(query, params)
            row = cursor.fetchone()
            
            if row:
                stats = {
                    'days_analyzed': days,
                    'total_commits': row['total_commits'] or 0,
                    'unique_authors': row['unique_authors'] or 0,
                    'total_files_changed': row['total_files_changed'] or 0,
                    'total_insertions': row['total_insertions'] or 0,
                    'total_deletions': row['total_deletions'] or 0,
                    'net_lines': (row['total_insertions'] or 0) - (row['total_deletions'] or 0),
                    'avg_quality_score': round(row['avg_quality_score'] or 0, 2),
                    'earliest_commit': row['earliest_commit'],
                    'latest_commit': row['latest_commit'],
                }
                
                # Calculate averages
                if stats['total_commits'] > 0:
                    stats['avg_commits_per_day'] = round(stats['total_commits'] / days, 2)
                    stats['avg_files_per_commit'] = round(
                        stats['total_files_changed'] / stats['total_commits'], 2
                    )
                else:
                    stats['avg_commits_per_day'] = 0
                    stats['avg_files_per_commit'] = 0
                
                return stats
            
            return {
                'days_analyzed': days,
                'total_commits': 0,
                'unique_authors': 0,
            }
    
    def save_file_hotspots(self, hotspot_data, days_analyzed=30):
        """
        Store frequently changed files (supports batch)
        
        Args:
            hotspot_data (list): List of file hotspot dictionaries
            days_analyzed (int): Number of days the analysis covered
            
        Returns:
            int: Number of hotspots saved
        """
        # Clear old hotspot data for this analysis period
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete old entries
            cursor.execute('''
                DELETE FROM file_hotspots 
                WHERE days_analyzed = ?
            ''', (days_analyzed,))
            
            saved_count = 0
            for hotspot in hotspot_data:
                try:
                    cursor.execute('''
                        INSERT INTO file_hotspots
                        (file_path, change_count, total_insertions, total_deletions,
                         last_modified, risk_level, unique_authors, authors, days_analyzed)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        hotspot.get('file'),
                        hotspot.get('changes') or hotspot.get('change_count', 0),
                        hotspot.get('insertions', 0),
                        hotspot.get('deletions', 0),
                        hotspot.get('last_modified'),
                        hotspot.get('risk_level', 'unknown'),
                        hotspot.get('unique_authors', 0),
                        json.dumps(hotspot.get('authors', [])),
                        days_analyzed
                    ))
                    saved_count += 1
                except Exception:
                    # Skip hotspots that fail to save
                    pass
            
            return saved_count
    
    # Alias for batch operations
    def save_hotspot_batch(self, hotspot_data, days_analyzed=30):
        """Batch save file hotspots (alias for save_file_hotspots)"""
        return self.save_file_hotspots(hotspot_data, days_analyzed)
    
    def get_file_hotspots(self, limit=10, days=30, min_changes=None):
        """
        Retrieve top changed files
        
        Args:
            limit (int): Maximum number of hotspots to return
            days (int): Filter by analysis period
            min_changes (int): Minimum change count filter (optional)
            
        Returns:
            list: List of file hotspots
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            query = '''
                SELECT 
                    file_path,
                    change_count,
                    total_insertions,
                    total_deletions,
                    (total_insertions - total_deletions) as net_lines,
                    last_modified,
                    risk_level,
                    unique_authors,
                    authors,
                    analysis_date,
                    days_analyzed
                FROM file_hotspots
                WHERE days_analyzed = ?
            '''
            
            params = [days]
            
            if min_changes:
                query += ' AND change_count >= ?'
                params.append(min_changes)
            
            query += ' ORDER BY change_count DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            hotspots = []
            for row in rows:
                hotspots.append({
                    'file': row['file_path'],
                    'changes': row['change_count'],
                    'insertions': row['total_insertions'],
                    'deletions': row['total_deletions'],
                    'net_lines': row['net_lines'],
                    'last_modified': row['last_modified'],
                    'risk_level': row['risk_level'],
                    'unique_authors': row['unique_authors'],
                    'authors': json.loads(row['authors']) if row['authors'] else [],
                    'analysis_date': row['analysis_date'],
                })
            
            # PHASE 4: Apply source code filter
            from .file_filter import filter_source_files
            hotspots = filter_source_files(hotspots)
            
            return hotspots
    
    def get_author_stats(self, author=None, days=30):
        """
        Get statistics for a specific author or all authors
        
        Args:
            author (str): Author name filter (optional)
            days (int): Number of days to analyze
            
        Returns:
            list: Author statistics
        """
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            query = '''
                SELECT 
                    author,
                    COUNT(*) as commit_count,
                    SUM(files_changed) as files_changed,
                    SUM(insertions) as insertions,
                    SUM(deletions) as deletions,
                    AVG(quality_score) as avg_quality_score
                FROM commits
                WHERE commit_date >= ?
            '''
            
            params = [since_date]
            
            if author:
                query += ' AND author LIKE ?'
                params.append(f'%{author}%')
            
            query += ' GROUP BY author ORDER BY commit_count DESC'
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            stats = []
            for row in rows:
                stats.append({
                    'author': row['author'],
                    'commits': row['commit_count'],
                    'files_changed': row['files_changed'],
                    'insertions': row['insertions'],
                    'deletions': row['deletions'],
                    'net_lines': row['insertions'] - row['deletions'],
                    'avg_quality_score': round(row['avg_quality_score'] or 0, 2),
                })
            
            return stats
    
    def clear_old_data(self, days=90):
        """
        Clear old analysis data
        
        Args:
            days (int): Delete data older than this many days
            
        Returns:
            dict: Count of deleted records
        """
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM commits WHERE commit_date < ?', (cutoff_date,))
            commits_deleted = cursor.rowcount
            
            cursor.execute('DELETE FROM file_hotspots WHERE analysis_date < ?', (cutoff_date,))
            hotspots_deleted = cursor.rowcount
            
            return {
                'commits_deleted': commits_deleted,
                'hotspots_deleted': hotspots_deleted,
            }
    
    def save_productivity_score(self, score_data):
        """
        Save productivity score to database
        
        Args:
            score_data (dict): Productivity score data
            
        Returns:
            bool: Success status
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Create productivity scores table if not exists
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS productivity_scores (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        score REAL NOT NULL,
                        grade TEXT,
                        frequency_score REAL,
                        quality_score REAL,
                        distribution_score REAL,
                        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        days_analyzed INTEGER
                    )
                ''')
                
                cursor.execute('''
                    INSERT INTO productivity_scores
                    (score, grade, frequency_score, quality_score, distribution_score, days_analyzed)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    score_data.get('score', 0),
                    score_data.get('grade', 'N/A'),
                    score_data.get('commit_frequency_score', 0),
                    score_data.get('quality_score', 0),
                    score_data.get('distribution_score', 0),
                    score_data.get('days_analyzed', 30)
                ))
                
                return True
        except Exception:
            return False


# Standalone utility functions

def save_commit_analysis(commit_data, db_path=None):
    """
    Standalone function to save commit analysis
    
    Args:
        commit_data (dict or list): Commit data to save
        db_path (str): Database path (optional)
        
    Returns:
        int: Number of commits saved
    """
    db = Database(db_path)
    return db.save_commit_analysis(commit_data)


def get_commit_stats(days=30, author=None, db_path=None):
    """
    Standalone function to get commit statistics
    
    Args:
        days (int): Number of days to analyze
        author (str): Author filter (optional)
        db_path (str): Database path (optional)
        
    Returns:
        dict: Commit statistics
    """
    db = Database(db_path)
    return db.get_commit_stats(days, author)


def save_file_hotspots(hotspot_data, days_analyzed=30, db_path=None):
    """
    Standalone function to save file hotspots
    
    Args:
        hotspot_data (list): Hotspot data to save
        days_analyzed (int): Analysis period
        db_path (str): Database path (optional)
        
    Returns:
        int: Number of hotspots saved
    """
    db = Database(db_path)
    return db.save_file_hotspots(hotspot_data, days_analyzed)


def get_file_hotspots(limit=10, days=30, db_path=None):
    """
    Standalone function to get file hotspots
    
    Args:
        limit (int): Maximum results
        days (int): Analysis period filter
        db_path (str): Database path (optional)
        
    Returns:
        list: File hotspots
    """
    db = Database(db_path)
    return db.get_file_hotspots(limit, days)
