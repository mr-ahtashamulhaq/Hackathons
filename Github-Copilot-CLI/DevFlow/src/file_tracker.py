"""
File change tracking and analysis module
"""

import git
from datetime import datetime, timedelta
from collections import defaultdict
from pathlib import Path


class FileTracker:
    """Track and analyze file changes from git history"""
    
    def __init__(self, repo_path='.'):
        """
        Initialize FileTracker with repository path
        
        Args:
            repo_path (str): Path to git repository
            
        Raises:
            ValueError: If path is not a valid git repository
        """
        try:
            self.repo_path = Path(repo_path).resolve()
            self.repo = git.Repo(self.repo_path, search_parent_directories=True)
        except git.exc.InvalidGitRepositoryError:
            raise ValueError(f"'{repo_path}' is not a valid git repository")
        except git.exc.NoSuchPathError:
            raise ValueError(f"Path '{repo_path}' does not exist")
        except Exception as e:
            raise ValueError(f"Error accessing repository: {str(e)}")
    
    def get_file_churn_rate(self, file_path, days=30):
        """
        Calculate how often a file changes (churn rate)
        
        Args:
            file_path (str): Relative path to file from repository root
            days (int): Number of days to analyze
            
        Returns:
            dict: Churn metrics including change count, frequency, and stats
        """
        try:
            since_date = datetime.now() - timedelta(days=days)
            changes = 0
            total_insertions = 0
            total_deletions = 0
            authors = set()
            
            for commit in self.repo.iter_commits(since=since_date, paths=file_path):
                if file_path in commit.stats.files:
                    changes += 1
                    stats = commit.stats.files[file_path]
                    total_insertions += stats['insertions']
                    total_deletions += stats['deletions']
                    authors.add(commit.author.name)
            
            churn_rate = changes / days if days > 0 else 0
            
            return {
                'file': file_path,
                'days_analyzed': days,
                'total_changes': changes,
                'churn_rate': round(churn_rate, 2),  # changes per day
                'total_insertions': total_insertions,
                'total_deletions': total_deletions,
                'net_lines': total_insertions - total_deletions,
                'unique_authors': len(authors),
                'authors': list(authors),
                'risk_level': self._calculate_risk_level(changes, days),
            }
        
        except Exception as e:
            raise ValueError(f"Error calculating churn rate for '{file_path}': {str(e)}")
    
    def identify_danger_zones(self, threshold=10, days=30, extension_filter=None):
        """
        Identify files changed more than threshold times (potential problem areas)
        
        Args:
            threshold (int): Minimum number of changes to consider a danger zone
            days (int): Number of days to analyze
            extension_filter (str): Filter by file extension (e.g., '.py', '.js')
            
        Returns:
            list: List of files with change counts exceeding threshold
        """
        try:
            since_date = datetime.now() - timedelta(days=days)
            file_changes = defaultdict(lambda: {
                'count': 0,
                'insertions': 0,
                'deletions': 0,
                'authors': set()
            })
            
            for commit in self.repo.iter_commits(since=since_date):
                for file_path, stats in commit.stats.files.items():
                    # Apply extension filter if specified
                    if extension_filter and not file_path.endswith(extension_filter):
                        continue
                    
                    file_changes[file_path]['count'] += 1
                    file_changes[file_path]['insertions'] += stats['insertions']
                    file_changes[file_path]['deletions'] += stats['deletions']
                    file_changes[file_path]['authors'].add(commit.author.name)
            
            # Filter files exceeding threshold
            danger_zones = []
            for file_path, data in file_changes.items():
                if data['count'] >= threshold:
                    danger_zones.append({
                        'file': file_path,
                        'changes': data['count'],
                        'insertions': data['insertions'],
                        'deletions': data['deletions'],
                        'net_lines': data['insertions'] - data['deletions'],
                        'churn_rate': round(data['count'] / days, 2),
                        'unique_authors': len(data['authors']),
                        'authors': list(data['authors']),
                        'risk_level': self._calculate_risk_level(data['count'], days),
                    })
            
            # Sort by change count (highest first)
            danger_zones.sort(key=lambda x: x['changes'], reverse=True)
            
            return danger_zones
        
        except Exception as e:
            raise ValueError(f"Error identifying danger zones: {str(e)}")
    
    def get_file_change_timeline(self, file_path, limit=None):
        """
        Get chronological timeline of commits that modified a specific file
        
        Args:
            file_path (str): Relative path to file from repository root
            limit (int): Maximum number of commits to return (optional)
            
        Returns:
            list: List of commits with timestamps and change details
        """
        try:
            timeline = []
            
            commits_iter = self.repo.iter_commits(paths=file_path)
            if limit:
                commits_iter = list(commits_iter)[:limit]
            
            for commit in commits_iter:
                if file_path in commit.stats.files:
                    stats = commit.stats.files[file_path]
                    timeline.append({
                        'sha': commit.hexsha,
                        'short_sha': commit.hexsha[:7],
                        'author': commit.author.name,
                        'email': commit.author.email,
                        'date': datetime.fromtimestamp(commit.committed_date),
                        'timestamp': commit.committed_date,
                        'message': commit.message.strip().split('\n')[0],  # First line only
                        'insertions': stats['insertions'],
                        'deletions': stats['deletions'],
                        'net_change': stats['insertions'] - stats['deletions'],
                    })
            
            return timeline
        
        except Exception as e:
            raise ValueError(f"Error getting timeline for '{file_path}': {str(e)}")
    
    def get_recently_changed_files(self, days=7, limit=20):
        """
        Get files that were recently modified
        
        Args:
            days (int): Number of days to look back
            limit (int): Maximum number of files to return
            
        Returns:
            list: Recently changed files with metadata
        """
        try:
            since_date = datetime.now() - timedelta(days=days)
            file_data = defaultdict(lambda: {
                'last_modified': None,
                'changes': 0,
                'last_author': None
            })
            
            for commit in self.repo.iter_commits(since=since_date):
                commit_date = datetime.fromtimestamp(commit.committed_date)
                for file_path in commit.stats.files.keys():
                    if not file_data[file_path]['last_modified'] or \
                       commit_date > file_data[file_path]['last_modified']:
                        file_data[file_path]['last_modified'] = commit_date
                        file_data[file_path]['last_author'] = commit.author.name
                    file_data[file_path]['changes'] += 1
            
            # Convert to list and sort by last modified date
            recent_files = [
                {
                    'file': file_path,
                    'last_modified': data['last_modified'],
                    'last_author': data['last_author'],
                    'changes': data['changes'],
                }
                for file_path, data in file_data.items()
            ]
            
            recent_files.sort(key=lambda x: x['last_modified'], reverse=True)
            
            return recent_files[:limit]
        
        except Exception as e:
            raise ValueError(f"Error getting recently changed files: {str(e)}")
    
    def _calculate_risk_level(self, changes, days):
        """
        Calculate risk level based on change frequency
        
        Args:
            changes (int): Number of changes
            days (int): Time period
            
        Returns:
            str: Risk level (low, medium, high, critical)
        """
        churn_rate = changes / days if days > 0 else 0
        
        if churn_rate >= 1.0:
            return 'critical'
        elif churn_rate >= 0.5:
            return 'high'
        elif churn_rate >= 0.2:
            return 'medium'
        else:
            return 'low'
    
    def get_file_statistics(self, file_path):
        """
        Get comprehensive statistics for a single file
        
        Args:
            file_path (str): Relative path to file from repository root
            
        Returns:
            dict: Complete file statistics
        """
        try:
            timeline = self.get_file_change_timeline(file_path)
            
            if not timeline:
                return {
                    'file': file_path,
                    'exists': False,
                    'total_commits': 0,
                }
            
            total_insertions = sum(entry['insertions'] for entry in timeline)
            total_deletions = sum(entry['deletions'] for entry in timeline)
            authors = list(set(entry['author'] for entry in timeline))
            
            return {
                'file': file_path,
                'exists': True,
                'total_commits': len(timeline),
                'first_commit': timeline[-1]['date'] if timeline else None,
                'last_commit': timeline[0]['date'] if timeline else None,
                'total_insertions': total_insertions,
                'total_deletions': total_deletions,
                'net_lines': total_insertions - total_deletions,
                'unique_authors': len(authors),
                'authors': authors,
                'avg_change_size': round((total_insertions + total_deletions) / len(timeline), 2) if timeline else 0,
            }
        
        except Exception as e:
            raise ValueError(f"Error getting statistics for '{file_path}': {str(e)}")


# Standalone utility functions

def get_file_churn_rate(file_path, days=30, repo_path='.'):
    """
    Standalone function to get file churn rate
    
    Args:
        file_path (str): Relative path to file
        days (int): Number of days to analyze
        repo_path (str): Repository path
        
    Returns:
        dict: Churn rate metrics
    """
    tracker = FileTracker(repo_path)
    return tracker.get_file_churn_rate(file_path, days)


def identify_danger_zones(threshold=10, days=30, repo_path='.'):
    """
    Standalone function to identify danger zones
    
    Args:
        threshold (int): Minimum changes to flag
        days (int): Number of days to analyze
        repo_path (str): Repository path
        
    Returns:
        list: Danger zone files
    """
    tracker = FileTracker(repo_path)
    return tracker.identify_danger_zones(threshold, days)


def get_file_change_timeline(file_path, repo_path='.'):
    """
    Standalone function to get file change timeline
    
    Args:
        file_path (str): Relative path to file
        repo_path (str): Repository path
        
    Returns:
        list: Timeline of commits
    """
    tracker = FileTracker(repo_path)
    return tracker.get_file_change_timeline(file_path)
