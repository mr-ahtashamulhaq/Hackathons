"""
Production-ready git repository analysis module using GitPython
"""

import git
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import re
from pathlib import Path
import statistics
from .file_filter import is_source_code_file, filter_source_files


class GitAnalyzer:
    """Production-ready git repository analyzer with comprehensive error handling"""
    
    CONVENTIONAL_COMMIT_PATTERN = r'^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!?:\s.+'
    TICKET_PATTERN = r'(#\d+|[A-Z]+-\d+|JIRA-\d+)'
    
    def __init__(self, repo_path='.'):
        """
        Initialize GitAnalyzer with comprehensive validation
        
        Args:
            repo_path (str): Path to git repository
            
        Raises:
            ValueError: If repository validation fails
        """
        try:
            self.repo_path = Path(repo_path).resolve()
            
            # Validate path exists
            if not self.repo_path.exists():
                raise ValueError(f"Path does not exist: {repo_path}")
            
            # Try to open repository
            try:
                self.repo = git.Repo(self.repo_path, search_parent_directories=True)
            except git.exc.InvalidGitRepositoryError:
                raise ValueError(f"Not a valid git repository: {repo_path}")
            except git.exc.NoSuchPathError:
                raise ValueError(f"Path not found: {repo_path}")
            
            # Detect if repo is empty
            self.is_empty = len(list(self.repo.heads)) == 0
            
            # Detect default branch
            self.default_branch = self._detect_default_branch()
            
            # Detect HEAD state
            self.is_detached = self._is_detached_head()
            
        except git.exc.GitError as e:
            raise ValueError(f"Git error: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to initialize analyzer: {str(e)}")
    
    def _detect_default_branch(self):
        """
        Dynamically detect the default branch
        
        Returns:
            str: Default branch name or 'HEAD'
        """
        if self.is_empty:
            return 'HEAD'
        
        try:
            # Try to get active branch
            return self.repo.active_branch.name
        except TypeError:
            # Detached HEAD - try to find main/master
            for branch_name in ['main', 'master', 'develop']:
                if branch_name in [b.name for b in self.repo.heads]:
                    return branch_name
            
            # Return first available branch
            if self.repo.heads:
                return self.repo.heads[0].name
            
            return 'HEAD'
    
    def _is_detached_head(self):
        """Check if repository is in detached HEAD state"""
        try:
            _ = self.repo.active_branch
            return False
        except TypeError:
            return True
    
    def get_commit_history(self, days=30, author=None, branch=None):
        """
        Get comprehensive commit history with error handling
        
        Args:
            days (int): Number of days to look back
            author (str): Filter by author name/email (optional)
            branch (str): Branch name (default: auto-detected)
            
        Returns:
            list: List of commit dictionaries with metadata
        """
        if self.is_empty:
            return []
        
        try:
            since_date = datetime.now() - timedelta(days=days)
            commits = []
            
            # Determine branch to analyze
            target_branch = branch or self.default_branch
            
            try:
                commit_iter = self.repo.iter_commits(target_branch, since=since_date)
            except git.exc.GitCommandError:
                # Branch doesn't exist or no commits
                return []
            
            for commit in commit_iter:
                # Apply author filter
                if author:
                    author_lower = author.lower()
                    if (author_lower not in commit.author.name.lower() and 
                        author_lower not in commit.author.email.lower()):
                        continue
                
                try:
                    commits.append({
                        'hash': commit.hexsha,
                        'short_hash': commit.hexsha[:7],
                        'author': commit.author.name,
                        'email': commit.author.email,
                        'message': commit.message.strip(),
                        'timestamp': datetime.fromtimestamp(commit.committed_date),
                        'files_changed': len(commit.stats.files),
                        'insertions': commit.stats.total['insertions'],
                        'deletions': commit.stats.total['deletions'],
                        'lines_changed': commit.stats.total['insertions'] + commit.stats.total['deletions'],
                    })
                except Exception:
                    # Skip commits that fail to parse
                    continue
            
            return commits
        
        except git.exc.GitCommandError:
            return []
        except Exception:
            return []
    
    def analyze_commit_patterns(self, days=30, author=None):
        """
        Analyze comprehensive commit patterns
        
        Args:
            days (int): Number of days to analyze
            author (str): Filter by author (optional)
            
        Returns:
            dict: Detailed pattern analysis
        """
        commits = self.get_commit_history(days=days, author=author)
        
        if not commits:
            return {
                'total_commits': 0,
                'commits_per_day': {},
                'commits_per_hour': {},
                'top_authors': [],
                'average_commit_message_length': 0,
                'workday_vs_weekend_ratio': 0,
            }
        
        # Initialize counters
        day_counts = defaultdict(int)
        hour_counts = defaultdict(int)
        author_counts = Counter()
        message_lengths = []
        weekday_commits = 0
        weekend_commits = 0
        
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for commit in commits:
            timestamp = commit['timestamp']
            
            # Day of week distribution
            day_name = day_names[timestamp.weekday()]
            day_counts[day_name] += 1
            
            # Hour distribution
            hour_counts[timestamp.hour] += 1
            
            # Author statistics
            author_counts[commit['author']] += 1
            
            # Message length
            message_lengths.append(len(commit['message']))
            
            # Workday vs weekend
            if timestamp.weekday() < 5:  # Monday-Friday
                weekday_commits += 1
            else:
                weekend_commits += 1
        
        # Calculate ratios and averages
        avg_msg_length = statistics.mean(message_lengths) if message_lengths else 0
        workday_ratio = (weekday_commits / len(commits) * 100) if commits else 0
        weekend_ratio = (weekend_commits / len(commits) * 100) if commits else 0
        
        return {
            'total_commits': len(commits),
            'commits_per_day': dict(sorted(
                day_counts.items(),
                key=lambda x: day_names.index(x[0])
            )),
            'commits_per_hour': dict(sorted(hour_counts.items())),
            'top_authors': [
                {'name': name, 'commits': count, 'percentage': round(count/len(commits)*100, 1)}
                for name, count in author_counts.most_common(10)
            ],
            'average_commit_message_length': round(avg_msg_length, 1),
            'workday_percentage': round(workday_ratio, 1),
            'weekend_percentage': round(weekend_ratio, 1),
            'workday_vs_weekend_ratio': round(workday_ratio / weekend_ratio, 2) if weekend_ratio > 0 else 0,
        }
    
    def get_hotspot_files(self, days=30, limit=10, author=None):
        """
        Get most frequently changed files using git log stats
        
        Args:
            days (int): Number of days to analyze
            limit (int): Maximum files to return
            author (str): Filter by author (optional)
            
        Returns:
            list: Tuples of (filepath, change_count, lines_changed)
        """
        if self.is_empty:
            return []
        
        try:
            since_date = datetime.now() - timedelta(days=days)
            file_stats = defaultdict(lambda: {'count': 0, 'lines': 0})
            
            try:
                commit_iter = self.repo.iter_commits(self.default_branch, since=since_date)
            except git.exc.GitCommandError:
                return []
            
            for commit in commit_iter:
                # Apply author filter
                if author:
                    author_lower = author.lower()
                    if (author_lower not in commit.author.name.lower() and 
                        author_lower not in commit.author.email.lower()):
                        continue
                
                try:
                    for filepath, stats in commit.stats.files.items():
                        # PHASE 4: Apply source code filter
                        if not is_source_code_file(filepath):
                            continue
                        
                        file_stats[filepath]['count'] += 1
                        file_stats[filepath]['lines'] += stats['insertions'] + stats['deletions']
                except Exception:
                    continue
            
            # Sort by change count
            hotspots = sorted(
                [(path, data['count'], data['lines']) for path, data in file_stats.items()],
                key=lambda x: x[1],
                reverse=True
            )[:limit]
            
            return hotspots
        
        except Exception:
            return []
    
    def calculate_commit_quality_score(self, commit_message):
        """
        Calculate quality score for a commit message
        
        Scoring criteria:
        - Length (20-72 chars): 25 points
        - Conventional commit format: 30 points
        - Ticket reference: 20 points
        - Not single word: 15 points
        - Has description body: 10 points
        
        Args:
            commit_message (str): Commit message to score
            
        Returns:
            int: Quality score (0-100)
        """
        if not commit_message:
            return 0
        
        score = 0
        lines = commit_message.strip().split('\n')
        subject = lines[0].strip()
        has_body = len(lines) > 1 and any(line.strip() for line in lines[1:])
        
        # Length score (20-72 characters is ideal)
        if 20 <= len(subject) <= 72:
            score += 25
        elif 10 <= len(subject) <= 100:
            score += 15
        
        # Conventional commit format
        if re.match(self.CONVENTIONAL_COMMIT_PATTERN, subject, re.IGNORECASE):
            score += 30
        
        # Ticket reference
        if re.search(self.TICKET_PATTERN, commit_message):
            score += 20
        
        # Not single word
        if len(subject.split()) > 1:
            score += 15
        
        # Has description body
        if has_body:
            score += 10
        
        return min(score, 100)
    
    def generate_productivity_score(self, days=30):
        """
        Generate comprehensive productivity score
        
        Combines:
        - Commit frequency consistency (40 points)
        - Average commit quality (30 points)
        - Working hours distribution (30 points)
        
        Args:
            days (int): Analysis period in days
            
        Returns:
            dict: Productivity metrics and score
        """
        commits = self.get_commit_history(days=days)
        
        if not commits:
            return {
                'score': 0,
                'grade': 'N/A',
                'commit_frequency_score': 0,
                'quality_score': 0,
                'distribution_score': 0,
                'insights': ['No commits found in analysis period']
            }
        
        # 1. Commit frequency consistency (40 points)
        daily_commits = defaultdict(int)
        for commit in commits:
            date_key = commit['timestamp'].date()
            daily_commits[date_key] += 1
        
        commit_counts = list(daily_commits.values())
        avg_daily = len(commits) / days
        
        # Score based on consistency and volume
        if avg_daily >= 3:
            frequency_score = 40
        elif avg_daily >= 1:
            frequency_score = 30
        elif avg_daily >= 0.5:
            frequency_score = 20
        else:
            frequency_score = 10
        
        # 2. Average commit quality (30 points)
        quality_scores = [
            self.calculate_commit_quality_score(commit['message'])
            for commit in commits
        ]
        avg_quality = statistics.mean(quality_scores) if quality_scores else 0
        quality_score = (avg_quality / 100) * 30
        
        # 3. Working hours distribution (30 points)
        work_hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]  # 9 AM - 5 PM
        work_hour_commits = sum(
            1 for commit in commits
            if commit['timestamp'].hour in work_hours and commit['timestamp'].weekday() < 5
        )
        
        work_hour_ratio = work_hour_commits / len(commits) if commits else 0
        
        # Balanced work-life: 50-80% during work hours is good
        if 0.5 <= work_hour_ratio <= 0.8:
            distribution_score = 30
        elif 0.3 <= work_hour_ratio <= 0.9:
            distribution_score = 20
        else:
            distribution_score = 10
        
        # Calculate total score
        total_score = frequency_score + quality_score + distribution_score
        
        # Determine grade
        if total_score >= 90:
            grade = 'A+'
        elif total_score >= 80:
            grade = 'A'
        elif total_score >= 70:
            grade = 'B'
        elif total_score >= 60:
            grade = 'C'
        else:
            grade = 'D'
        
        # Generate insights
        insights = []
        if avg_daily < 1:
            insights.append('Consider increasing commit frequency')
        if avg_quality < 50:
            insights.append('Improve commit message quality with conventional commits')
        if work_hour_ratio > 0.9:
            insights.append('High late-night activity detected')
        if work_hour_ratio < 0.3:
            insights.append('Unusual commit time distribution')
        
        if not insights:
            insights.append('Great productivity patterns!')
        
        return {
            'score': round(total_score, 1),
            'grade': grade,
            'commit_frequency_score': round(frequency_score, 1),
            'quality_score': round(quality_score, 1),
            'distribution_score': round(distribution_score, 1),
            'average_daily_commits': round(avg_daily, 2),
            'average_quality': round(avg_quality, 1),
            'work_hour_percentage': round(work_hour_ratio * 100, 1),
            'insights': insights,
        }
    
    def get_repository_stats(self):
        """
        Get comprehensive repository statistics with error handling
        
        Returns:
            dict: Repository metadata
        """
        try:
            stats = {
                'path': str(self.repo_path),
                'is_empty': self.is_empty,
                'default_branch': self.default_branch,
                'is_detached': self.is_detached,
                'total_branches': len(list(self.repo.heads)),
                'remotes': [remote.name for remote in self.repo.remotes],
                'is_dirty': self.repo.is_dirty(),
                'untracked_files': len(self.repo.untracked_files),
            }
            
            # Count total commits safely
            if not self.is_empty:
                try:
                    stats['total_commits'] = sum(1 for _ in self.repo.iter_commits(self.default_branch))
                except git.exc.GitCommandError:
                    stats['total_commits'] = 0
            else:
                stats['total_commits'] = 0
            
            return stats
        
        except Exception as e:
            return {
                'path': str(self.repo_path),
                'error': str(e)
            }
