"""
DevFlow Insight Engine
Generates actionable developer intelligence from analytics data
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict, Counter


class InsightEngine:
    """Generate actionable insights from DevFlow analytics data"""
    
    # PART 6: Insight structure constants
    SEVERITY_LOW = "low"
    SEVERITY_MEDIUM = "medium"
    SEVERITY_HIGH = "high"
    
    TYPE_RISK = "risk"
    TYPE_WORKFLOW = "workflow"
    TYPE_HEALTH = "health"
    TYPE_COMMAND = "command"
    
    def __init__(self, analytics_data: Dict[str, Any]):
        """
        Initialize InsightEngine with analytics data
        
        Args:
            analytics_data: Dict containing:
                - file_hotspots: List of file risk data
                - commits: List of commit data
                - command_usage: List of command usage data
                - contributor_stats: Dict of contributor statistics
        """
        self.data = analytics_data
        self.insights = []
    
    def generate_all_insights(self) -> List[Dict[str, Any]]:
        """
        Generate all insights from analytics data
        
        Returns:
            List of insight dictionaries
        """
        self.insights = []
        
        # Generate all insight types
        self.generate_risk_insights()
        self.generate_workflow_insights()
        self.generate_repo_health_insights()
        self.generate_command_insights()
        
        return self.insights
    
    # PART 2: RISK INSIGHT RULES
    
    def generate_risk_insights(self):
        """Generate insights about file and code risks"""
        file_hotspots = self.data.get('file_hotspots', [])
        
        if not file_hotspots:
            return
        
        # High Risk File Detection
        high_risk_files = [f for f in file_hotspots if f.get('riskScore', 0) > 75]
        if high_risk_files:
            top_risk = high_risk_files[0]
            self._add_insight(
                type_=self.TYPE_RISK,
                severity=self.SEVERITY_HIGH,
                title="Critical Risk File Detected",
                description=f"{top_risk['path']} has a risk score of {top_risk['riskScore']}/100 with {top_risk.get('changeCount', 0)} changes.",
                recommendation="Review this file for refactoring opportunities. Consider breaking it into smaller, more focused modules."
            )
        
        # Single Contributor Risk
        single_contributor_high_change = [
            f for f in file_hotspots 
            if f.get('contributors', 0) <= 1 and f.get('changeCount', 0) > 10
        ]
        if single_contributor_high_change:
            count = len(single_contributor_high_change)
            self._add_insight(
                type_=self.TYPE_RISK,
                severity=self.SEVERITY_MEDIUM,
                title="Single Contributor Risk",
                description=f"{count} file(s) have only one contributor despite high change frequency. Example: {single_contributor_high_change[0]['path']}",
                recommendation="Encourage code reviews and pair programming on these files to distribute knowledge and reduce bus factor risk."
            )
        
        # Rapid Churn Warning (changed in last 3 days with high frequency)
        recent_churn = [
            f for f in file_hotspots 
            if f.get('lastModifiedDaysAgo', 999) <= 3 and f.get('changeCount', 0) > 5
        ]
        if recent_churn:
            self._add_insight(
                type_=self.TYPE_RISK,
                severity=self.SEVERITY_MEDIUM,
                title="Rapid File Churn Detected",
                description=f"{len(recent_churn)} file(s) have been changed frequently in the last 3 days, indicating possible instability.",
                recommendation="Review recent changes for potential issues. Consider stabilizing these files before adding new features."
            )
    
    # PART 3: WORKFLOW INSIGHTS
    
    def generate_workflow_insights(self):
        """Generate insights about developer workflow patterns"""
        commits = self.data.get('commits', [])
        
        if not commits:
            return
        
        # Analyze commit patterns
        hours = defaultdict(int)
        weekdays = defaultdict(int)
        
        for commit in commits:
            timestamp = commit.get('timestamp')
            if timestamp:
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    hours[dt.hour] += 1
                    weekdays[dt.strftime('%A')] += 1
                except:
                    continue
        
        # Most Productive Coding Hour
        if hours:
            peak_hour = max(hours.items(), key=lambda x: x[1])
            if peak_hour[1] >= 3:  # At least 3 commits
                hour_12 = peak_hour[0] % 12 or 12
                am_pm = "AM" if peak_hour[0] < 12 else "PM"
                self._add_insight(
                    type_=self.TYPE_WORKFLOW,
                    severity=self.SEVERITY_LOW,
                    title="Peak Productivity Hour Identified",
                    description=f"Most commits occur at {hour_12}:00 {am_pm} ({peak_hour[1]} commits). This appears to be your most productive coding time.",
                    recommendation="Protect this time block from meetings and interruptions for focused coding work."
                )
        
        # Most Productive Weekday
        if weekdays:
            peak_day = max(weekdays.items(), key=lambda x: x[1])
            if peak_day[1] >= 3:
                self._add_insight(
                    type_=self.TYPE_WORKFLOW,
                    severity=self.SEVERITY_LOW,
                    title=f"{peak_day[0]} is Your Most Productive Day",
                    description=f"{peak_day[1]} commits on {peak_day[0]}s indicate this is your most productive day of the week.",
                    recommendation="Schedule important coding tasks and deep work for this day when possible."
                )
        
        # Late Night Coding Detection (10 PM - 5 AM)
        late_night_commits = sum(hours[h] for h in range(22, 24)) + sum(hours[h] for h in range(0, 6))
        total_commits = sum(hours.values())
        
        if total_commits > 0 and (late_night_commits / total_commits) > 0.3:
            self._add_insight(
                type_=self.TYPE_WORKFLOW,
                severity=self.SEVERITY_MEDIUM,
                title="Late Night Coding Pattern Detected",
                description=f"{late_night_commits} commits ({int(late_night_commits/total_commits*100)}%) occur between 10 PM and 5 AM.",
                recommendation="Consider adjusting work schedule for better work-life balance. Late night coding can lead to burnout and lower code quality."
            )
        
        # Low Consistency Score (commits spread sporadically)
        active_days = len(set(commit.get('date') for commit in commits if commit.get('date')))
        if total_commits >= 10 and active_days >= 7:
            commits_per_day = total_commits / active_days
            if commits_per_day < 2:
                self._add_insight(
                    type_=self.TYPE_WORKFLOW,
                    severity=self.SEVERITY_LOW,
                    title="Low Commit Consistency",
                    description=f"Average of {commits_per_day:.1f} commits per active day. Sporadic commit patterns detected.",
                    recommendation="Try to maintain a more consistent commit rhythm. Small, frequent commits are easier to review and debug."
                )
    
    # PART 4: REPO HEALTH INSIGHTS
    
    def generate_repo_health_insights(self):
        """Generate insights about repository health"""
        file_hotspots = self.data.get('file_hotspots', [])
        commits = self.data.get('commits', [])
        contributor_stats = self.data.get('contributor_stats', {})
        
        # Low Bus Factor Areas
        critical_single_owner = [
            f for f in file_hotspots 
            if f.get('contributors', 0) == 1 and f.get('riskScore', 0) > 50
        ]
        if critical_single_owner:
            self._add_insight(
                type_=self.TYPE_HEALTH,
                severity=self.SEVERITY_HIGH,
                title="Low Bus Factor Warning",
                description=f"{len(critical_single_owner)} critical file(s) have only one contributor. Knowledge is concentrated in single developers.",
                recommendation="Implement mandatory code reviews and encourage pair programming to distribute knowledge across the team."
            )
        
        # Unstable Modules (high churn + multiple contributors)
        unstable_modules = [
            f for f in file_hotspots 
            if f.get('changeCount', 0) > 15 and f.get('contributors', 0) >= 3
        ]
        if unstable_modules:
            self._add_insight(
                type_=self.TYPE_HEALTH,
                severity=self.SEVERITY_MEDIUM,
                title="Unstable Modules Detected",
                description=f"{len(unstable_modules)} file(s) show high churn with multiple contributors, indicating potential design issues or unclear requirements.",
                recommendation="Review architecture and requirements for these modules. High churn with many contributors often signals unclear ownership or design flaws."
            )
        
        # Overloaded Contributors (one person doing most commits)
        if contributor_stats and len(contributor_stats) > 1:
            total_commits = sum(contributor_stats.values())
            if total_commits > 0:
                for contributor, count in contributor_stats.items():
                    percentage = (count / total_commits) * 100
                    if percentage > 60:
                        self._add_insight(
                            type_=self.TYPE_HEALTH,
                            severity=self.SEVERITY_MEDIUM,
                            title="Contributor Overload Detected",
                            description=f"{contributor} is responsible for {percentage:.0f}% of all commits. Workload is heavily concentrated.",
                            recommendation="Distribute work more evenly across the team to prevent burnout and reduce dependency on single individuals."
                        )
                        break
    
    # PART 5: COMMAND BEHAVIOR INSIGHTS
    
    def generate_command_insights(self):
        """Generate insights about command usage patterns"""
        command_usage = self.data.get('command_usage', [])
        
        if not command_usage:
            return
        
        # Build command frequency map
        commands = {cmd['command']: cmd.get('count', 0) for cmd in command_usage}
        total_commands = sum(commands.values())
        
        if total_commands == 0:
            return
        
        # High Reset/Rebase Usage
        reset_count = commands.get('git reset', 0) + commands.get('git rebase', 0)
        if reset_count > 0 and (reset_count / total_commands) > 0.1:
            self._add_insight(
                type_=self.TYPE_COMMAND,
                severity=self.SEVERITY_MEDIUM,
                title="High Reset/Rebase Activity",
                description=f"Git reset/rebase used {reset_count} times ({int(reset_count/total_commands*100)}% of commands). May indicate workflow issues.",
                recommendation="Review branching strategy and commit practices. Frequent resets may signal unclear requirements or rushed commits."
            )
        
        # Low Testing Commands
        test_commands = sum(
            commands.get(cmd, 0) 
            for cmd in ['npm test', 'pytest', 'cargo test', 'go test', 'mvn test']
        )
        if total_commands >= 20 and test_commands == 0:
            self._add_insight(
                type_=self.TYPE_COMMAND,
                severity=self.SEVERITY_HIGH,
                title="No Testing Commands Detected",
                description="No test execution commands found in recent history. Tests may not be running regularly.",
                recommendation="Integrate testing into your workflow. Run tests before commits and consider setting up pre-commit hooks."
            )
        elif test_commands > 0 and (test_commands / total_commands) < 0.05:
            self._add_insight(
                type_=self.TYPE_COMMAND,
                severity=self.SEVERITY_MEDIUM,
                title="Infrequent Testing",
                description=f"Only {test_commands} test command(s) found ({int(test_commands/total_commands*100)}% of total). Tests may not be running frequently enough.",
                recommendation="Increase test frequency. Aim to run tests before every commit or use continuous testing tools."
            )
        
        # High Rollback Behavior
        rollback_count = commands.get('git revert', 0) + commands.get('git reset --hard', 0)
        if rollback_count > 0 and (rollback_count / total_commands) > 0.05:
            self._add_insight(
                type_=self.TYPE_COMMAND,
                severity=self.SEVERITY_MEDIUM,
                title="Frequent Rollbacks Detected",
                description=f"{rollback_count} rollback command(s) detected. This may indicate unstable code or inadequate testing.",
                recommendation="Improve testing coverage and code review process before merging. Consider feature flags for safer deployments."
            )
    
    # Helper Methods
    
    def _add_insight(
        self, 
        type_: str, 
        severity: str, 
        title: str, 
        description: str, 
        recommendation: str
    ):
        """Add an insight to the list"""
        self.insights.append({
            'type': type_,
            'severity': severity,
            'title': title,
            'description': description,
            'recommendation': recommendation,
            'timestamp': datetime.now().isoformat()
        })
    
    def get_insights_by_severity(self, severity: str) -> List[Dict[str, Any]]:
        """Get insights filtered by severity"""
        return [i for i in self.insights if i['severity'] == severity]
    
    def get_insights_by_type(self, type_: str) -> List[Dict[str, Any]]:
        """Get insights filtered by type"""
        return [i for i in self.insights if i['type'] == type_]
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all insights"""
        return {
            'total': len(self.insights),
            'by_severity': {
                'high': len(self.get_insights_by_severity(self.SEVERITY_HIGH)),
                'medium': len(self.get_insights_by_severity(self.SEVERITY_MEDIUM)),
                'low': len(self.get_insights_by_severity(self.SEVERITY_LOW))
            },
            'by_type': {
                'risk': len(self.get_insights_by_type(self.TYPE_RISK)),
                'workflow': len(self.get_insights_by_type(self.TYPE_WORKFLOW)),
                'health': len(self.get_insights_by_type(self.TYPE_HEALTH)),
                'command': len(self.get_insights_by_type(self.TYPE_COMMAND))
            }
        }
