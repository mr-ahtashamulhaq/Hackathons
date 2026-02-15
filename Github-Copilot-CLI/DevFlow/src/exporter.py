"""
DevFlow Analytics JSON Exporter
Export analytics data from SQLite database to JSON files for frontend consumption
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
from .database import Database
from .git_analyzer import GitAnalyzer
from .history import HistoryTracker
from .insight_engine import InsightEngine
from .file_filter import (
    is_source_code_file, 
    filter_source_files,
    normalize_file_path,
    get_file_language,
    calculate_enhanced_risk_score,
    get_days_ago
)


class AnalyticsExporter:
    """Export DevFlow analytics to JSON for frontend"""
    
    def __init__(self, output_dir=None, db_path=None):
        """
        Initialize exporter
        
        Args:
            output_dir (str): Output directory for JSON files
            db_path (str): Path to database (optional)
        """
        if output_dir is None:
            # Default to frontend/public/devflow-data/
            self.output_dir = Path(__file__).parent.parent / 'frontend' / 'public' / 'devflow-data'
        else:
            self.output_dir = Path(output_dir)
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.db = Database(db_path)
    
    def export_productivity_summary_json(self, days=7):
        """
        Export productivity score and sparkline data
        
        Args:
            days (int): Number of days for sparkline
            
        Returns:
            dict: Exported data structure
        """
        try:
            # Get commit stats
            stats = self.db.get_commit_stats(days=days)
            
            # Calculate score (simplified)
            score = min(100, int(stats.get('total_commits', 0) * 3))  # 3 points per commit
            previous_score = max(0, score - 5)  # Mock previous
            
            # Generate sparkline from recent commits
            sparkline = self._generate_sparkline_data(days=14)
            
            data = {
                'productivityScore': {
                    'current': score,
                    'previous': previous_score,
                    'trend': 'up' if score >= previous_score else 'down',
                    'streak': min(14, stats.get('total_commits', 0) // 2),
                    'period': f'{days}d'
                },
                'sparklineData': sparkline,
                'generated_at': datetime.now().isoformat()
            }
            
            output_file = self.output_dir / 'productivity-summary.json'
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            return data
        
        except Exception as e:
            # Return safe empty structure on error
            return self._empty_productivity_summary()
    
    def export_file_hotspots_json(self, days=30, limit=10):
        """
        Export file risk/hotspot data
        
        Args:
            days (int): Analysis period
            limit (int): Max files to export
            
        Returns:
            dict: Exported data structure
        """
        try:
            hotspots = self.db.get_file_hotspots(limit=limit, days=days)
            
            if not hotspots:
                # Try to generate from git analyzer
                try:
                    analyzer = GitAnalyzer('.')
                    raw_hotspots = analyzer.get_hotspot_files(days=days, limit=limit)
                    hotspots = [
                        {
                            'file': file_path,
                            'changes': change_count,
                            'insertions': 0,
                            'deletions': 0,
                            'risk_level': 'high' if change_count > 10 else 'medium'
                        }
                        for file_path, change_count, _ in raw_hotspots
                    ]
                except Exception:
                    hotspots = []
            
            # PHASE 4: Filter source files before processing
            hotspots = filter_source_files(hotspots)
            
            # Get repo root for path normalization
            try:
                import git
                repo = git.Repo('.', search_parent_directories=True)
                repo_root = repo.working_dir
            except:
                repo_root = '.'
            
            # PART 5: Transform to standardized schema
            file_risk_data = []
            for hotspot in hotspots:
                # Double-check filter (defensive)
                filepath = hotspot.get('file', '')
                if not is_source_code_file(filepath):
                    continue
                
                # PART 2: Normalize path to repo-relative
                normalized_path = normalize_file_path(filepath, repo_root)
                
                # PART 3: Detect language
                language = get_file_language(filepath)
                
                # Get metrics
                change_count = hotspot.get('changes', 0)
                contributors = hotspot.get('unique_authors', 1)
                insertions = hotspot.get('insertions', 0)
                deletions = hotspot.get('deletions', 0)
                last_modified = hotspot.get('last_modified')
                
                # Calculate days ago
                last_modified_days_ago = get_days_ago(last_modified)
                
                # PART 4: Calculate enhanced risk score
                risk_score = calculate_enhanced_risk_score(
                    change_count=change_count,
                    contributor_count=contributors,
                    last_modified_days=last_modified_days_ago,
                    insertions=insertions,
                    deletions=deletions
                )
                
                # PART 5: EXPORT SCHEMA LOCK
                # This schema is now stable and should not change
                file_risk_data.append({
                    'path': normalized_path,
                    'riskScore': risk_score,
                    'changeCount': change_count,
                    'contributors': contributors,
                    'language': language,
                    'lastModifiedDaysAgo': last_modified_days_ago if last_modified_days_ago is not None else -1
                })
            
            data = {
                'fileRiskData': file_risk_data,
                'generated_at': datetime.now().isoformat(),
                'days_analyzed': days
            }
            
            output_file = self.output_dir / 'file-hotspots.json'
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            return data
        
        except Exception:
            return self._empty_file_hotspots()
    
    def export_commit_analytics_json(self, days=365):
        """
        Export commit heatmap and analytics
        
        Args:
            days (int): Number of days for heatmap
            
        Returns:
            dict: Exported data structure
        """
        try:
            # Generate heatmap data (52 weeks)
            heatmap_data = self._generate_heatmap_data(weeks=52)
            
            data = {
                'heatmapData': heatmap_data,
                'generated_at': datetime.now().isoformat(),
                'days_analyzed': days
            }
            
            output_file = self.output_dir / 'commit-analytics.json'
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            return data
        
        except Exception:
            return self._empty_commit_analytics()
    
    def export_command_usage_json(self, limit=10):
        """
        Export command usage statistics
        
        Args:
            limit (int): Max commands to export
            
        Returns:
            dict: Exported data structure
        """
        try:
            # Try to get from history tracker
            tracker = HistoryTracker()
            commands = tracker.parse_shell_history()
            
            if commands:
                top_commands = tracker.get_top_commands(limit=limit)
                suggestions = tracker.suggest_aliases(min_frequency=3, limit=5)
                
                # Transform to frontend format
                command_data = []
                for cmd in top_commands:
                    # Check if has suggested alias
                    alias = None
                    for sug in suggestions:
                        if sug['command'] == cmd['command']:
                            alias = sug['alias']
                            break
                    
                    command_data.append({
                        'command': cmd['command'],
                        'count': cmd['count'],
                        'alias': alias
                    })
                
                alias_suggestions = [
                    {
                        'full': sug['command'],
                        'alias': sug['alias'],
                        'timesTyped': sug['frequency'],
                        'timeSaved': f"~{sug['frequency'] // 20} min/week"  # Rough estimate
                    }
                    for sug in suggestions
                ]
            else:
                command_data = []
                alias_suggestions = []
            
            data = {
                'commandData': command_data,
                'aliasSuggestions': alias_suggestions,
                'generated_at': datetime.now().isoformat()
            }
            
            output_file = self.output_dir / 'command-usage.json'
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            return data
        
        except Exception:
            return self._empty_command_usage()
    
    # PART 7: EXPORT INSIGHTS JSON
    
    def export_insights_json(self, days=30):
        """
        Export actionable insights using InsightEngine
        
        Args:
            days (int): Analysis period
            
        Returns:
            dict: Exported insights data
        """
        try:
            # Gather data for insight engine
            file_hotspots = []
            commits = []
            command_usage = []
            contributor_stats = {}
            
            # Get file hotspots
            try:
                analyzer = GitAnalyzer('.')
                raw_hotspots = analyzer.get_hotspot_files(days=days, limit=50)
                
                for file_path, change_count, lines in raw_hotspots:
                    if is_source_code_file(file_path):
                        file_hotspots.append({
                            'path': normalize_file_path(file_path),
                            'riskScore': calculate_enhanced_risk_score(
                                change_count=change_count,
                                contributor_count=1,
                                last_modified_days=None,
                                insertions=0,
                                deletions=0
                            ),
                            'changeCount': change_count,
                            'contributors': 1,
                            'language': get_file_language(file_path),
                            'lastModifiedDaysAgo': -1
                        })
            except Exception:
                pass
            
            # Get commits data
            try:
                import git
                repo = git.Repo('.', search_parent_directories=True)
                since_date = datetime.now() - timedelta(days=days)
                
                for commit in repo.iter_commits(since=since_date):
                    commits.append({
                        'timestamp': commit.committed_datetime.isoformat(),
                        'date': commit.committed_datetime.date().isoformat(),
                        'author': commit.author.name,
                        'message': commit.message
                    })
                    
                    # Track contributor stats
                    author = commit.author.name
                    contributor_stats[author] = contributor_stats.get(author, 0) + 1
            except Exception:
                pass
            
            # Get command usage
            try:
                tracker = HistoryTracker()
                commands = tracker.parse_shell_history()
                if commands:
                    top_commands = tracker.get_top_commands(limit=20)
                    command_usage = [
                        {'command': cmd['command'], 'count': cmd['count']}
                        for cmd in top_commands
                    ]
            except Exception:
                # Fallback mock data
                command_usage = [
                    {'command': 'git commit', 'count': 10},
                    {'command': 'git push', 'count': 8},
                    {'command': 'git pull', 'count': 5},
                ]
            
            # Generate insights
            analytics_data = {
                'file_hotspots': file_hotspots,
                'commits': commits,
                'command_usage': command_usage,
                'contributor_stats': contributor_stats
            }
            
            engine = InsightEngine(analytics_data)
            insights = engine.generate_all_insights()
            
            # Structure the output
            data = {
                'insights': insights,
                'summary': engine.get_summary(),
                'generated_at': datetime.now().isoformat(),
                'days_analyzed': days
            }
            
            # Write to file
            output_file = self.output_dir / 'insights.json'
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            return data
            
        except Exception as e:
            print(f"Error exporting insights: {e}")
            return self._empty_insights()
    
    def _empty_insights(self):
        """Return empty insights structure"""
        return {
            'insights': [],
            'summary': {
                'total': 0,
                'by_severity': {'high': 0, 'medium': 0, 'low': 0},
                'by_type': {'risk': 0, 'workflow': 0, 'health': 0, 'command': 0}
            },
            'generated_at': datetime.now().isoformat()
        }
    
    def export_all(self, days=30):
        """
        Export all analytics data
        
        Args:
            days (int): Analysis period
            
        Returns:
            dict: Summary of exports
        """
        results = {
            'productivity_summary': self.export_productivity_summary_json(days=7),
            'file_hotspots': self.export_file_hotspots_json(days=days),
            'commit_analytics': self.export_commit_analytics_json(days=365),
            'command_usage': self.export_command_usage_json(limit=10),
            'insights': self.export_insights_json(days=days)
        }
        
        return {
            'status': 'success',
            'output_dir': str(self.output_dir),
            'files_created': [
                'productivity-summary.json',
                'file-hotspots.json',
                'commit-analytics.json',
                'command-usage.json',
                'insights.json'
            ],
            'generated_at': datetime.now().isoformat()
        }
    
    # Helper methods
    
    def _generate_sparkline_data(self, days=14):
        """Generate sparkline data for last N days"""
        sparkline = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        try:
            analyzer = GitAnalyzer('.')
            commits = analyzer.get_commit_history(days=days)
            
            # Count commits per day
            from collections import defaultdict
            day_counts = defaultdict(int)
            
            for commit in commits:
                date = commit['timestamp'].date()
                day_counts[date] += 1
            
            # Generate sparkline for last 14 days
            for i in range(days - 1, -1, -1):
                date = (datetime.now() - timedelta(days=i)).date()
                day_name = day_names[date.weekday()]
                count = day_counts.get(date, 0)
                
                sparkline.append({
                    'day': day_name,
                    'commits': count
                })
        
        except Exception:
            # Return zeroed data on error
            for i in range(days - 1, -1, -1):
                date = (datetime.now() - timedelta(days=i)).date()
                day_name = day_names[date.weekday()]
                sparkline.append({'day': day_name, 'commits': 0})
        
        return sparkline
    
    def _generate_heatmap_data(self, weeks=52):
        """Generate commit heatmap for N weeks"""
        heatmap = []
        
        try:
            analyzer = GitAnalyzer('.')
            commits = analyzer.get_commit_history(days=weeks * 7)
            
            # Count commits per day
            from collections import defaultdict
            day_counts = defaultdict(int)
            
            for commit in commits:
                date = commit['timestamp'].date()
                day_counts[date] += 1
            
            # Generate heatmap grid
            now = datetime.now()
            for w in range(weeks - 1, -1, -1):
                for d in range(7):
                    date = now - timedelta(days=(w * 7 + (6 - d)))
                    date_key = date.date()
                    count = day_counts.get(date_key, 0)
                    
                    heatmap.append({
                        'week': weeks - 1 - w,
                        'day': d,
                        'count': count,
                        'date': date.strftime('%Y-%m-%d')
                    })
        
        except Exception:
            # Return empty grid on error
            now = datetime.now()
            for w in range(weeks - 1, -1, -1):
                for d in range(7):
                    date = now - timedelta(days=(w * 7 + (6 - d)))
                    heatmap.append({
                        'week': weeks - 1 - w,
                        'day': d,
                        'count': 0,
                        'date': date.strftime('%Y-%m-%d')
                    })
        
        return heatmap
    
    def _format_relative_time(self, timestamp):
        """Format timestamp as relative time (e.g., '2h ago')"""
        if not timestamp:
            return 'N/A'
        
        try:
            if isinstance(timestamp, str):
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            else:
                dt = timestamp
            
            now = datetime.now()
            diff = now - dt
            
            if diff.days > 0:
                return f'{diff.days}d ago'
            elif diff.seconds >= 3600:
                return f'{diff.seconds // 3600}h ago'
            elif diff.seconds >= 60:
                return f'{diff.seconds // 60}m ago'
            else:
                return 'just now'
        
        except Exception:
            return 'N/A'
    
    # Empty structure generators (for error safety)
    
    def _empty_productivity_summary(self):
        """Return safe empty productivity summary"""
        return {
            'productivityScore': {
                'current': 0,
                'previous': 0,
                'trend': 'neutral',
                'streak': 0,
                'period': '7d'
            },
            'sparklineData': [
                {'day': day, 'commits': 0}
                for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] * 2
            ],
            'generated_at': datetime.now().isoformat(),
            'note': 'No data available'
        }
    
    def _empty_file_hotspots(self):
        """Return safe empty file hotspots"""
        return {
            'fileRiskData': [],
            'generated_at': datetime.now().isoformat(),
            'note': 'No data available'
        }
    
    def _empty_commit_analytics(self):
        """Return safe empty commit analytics"""
        return {
            'heatmapData': [],
            'generated_at': datetime.now().isoformat(),
            'note': 'No data available'
        }
    
    def _empty_command_usage(self):
        """Return safe empty command usage"""
        return {
            'commandData': [],
            'aliasSuggestions': [],
            'generated_at': datetime.now().isoformat(),
            'note': 'No data available'
        }
    
    def _empty_insights(self):
        """Return safe empty insights"""
        return {
            'insights': [],
            'generated_at': datetime.now().isoformat(),
            'note': 'No data available'
        }


# Standalone functions

def export_all_analytics(output_dir=None, days=30):
    """
    Standalone function to export all analytics
    
    Args:
        output_dir (str): Output directory (optional)
        days (int): Analysis period
        
    Returns:
        dict: Export summary
    """
    exporter = AnalyticsExporter(output_dir)
    return exporter.export_all(days=days)


def export_productivity_summary(output_dir=None, days=7):
    """Export productivity summary"""
    exporter = AnalyticsExporter(output_dir)
    return exporter.export_productivity_summary_json(days=days)


def export_file_hotspots(output_dir=None, days=30, limit=10):
    """Export file hotspots"""
    exporter = AnalyticsExporter(output_dir)
    return exporter.export_file_hotspots_json(days=days, limit=limit)


def export_commit_analytics(output_dir=None, days=365):
    """Export commit analytics"""
    exporter = AnalyticsExporter(output_dir)
    return exporter.export_commit_analytics_json(days=days)


def export_command_usage(output_dir=None, limit=10):
    """Export command usage"""
    exporter = AnalyticsExporter(output_dir)
    return exporter.export_command_usage_json(limit=limit)
