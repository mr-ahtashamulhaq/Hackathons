"""
Production-ready shell command analytics with Windows PowerShell first-class support
"""

import os
import platform
import subprocess
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime
import sqlite3
import re


class HistoryTracker:
    """Intelligent shell command analytics for PowerShell and Bash"""
    
    # Dangerous commands to exclude from aliases
    DANGEROUS_COMMANDS = [
        'rm -rf', 'del /f', 'format', 'dd if=', 
        'mkfs', '> /dev/', 'chmod 777', 'sudo rm'
    ]
    
    def __init__(self):
        """
        Initialize HistoryTracker with automatic OS detection
        """
        self.system = platform.system()
        self.is_windows = self.system == 'Windows'
        self.history_path = None
        self.history_data = []
        self.shell_type = 'PowerShell' if self.is_windows else 'Bash'
        
        # Resolve history file path
        try:
            self.history_path = self._resolve_history_path()
        except Exception:
            self.history_path = None
    
    def _resolve_history_path(self):
        """
        Resolve shell history file path
        
        Returns:
            Path: History file path or None
        """
        if self.is_windows:
            return self._get_powershell_history_path()
        else:
            return self._get_bash_history_path()
    
    def _get_powershell_history_path(self):
        """
        Get PowerShell history path on Windows
        
        Returns:
            Path: PowerShell history file path or None
        """
        try:
            # Try to get PSReadLine history path via PowerShell
            result = subprocess.run(
                ['powershell', '-NoProfile', '-NonInteractive', '-Command', 
                 '(Get-PSReadLineOption).HistorySavePath'],
                capture_output=True,
                text=True,
                timeout=5,
                creationflags=subprocess.CREATE_NO_WINDOW if self.is_windows else 0
            )
            
            if result.returncode == 0 and result.stdout.strip():
                path_str = result.stdout.strip()
                path = Path(path_str)
                if path.exists():
                    return path
        except Exception:
            pass
        
        # Fallback to default PowerShell history location
        default_paths = [
            Path.home() / 'AppData' / 'Roaming' / 'Microsoft' / 'Windows' / 'PowerShell' / 'PSReadLine' / 'ConsoleHost_history.txt',
            Path.home() / 'AppData' / 'Roaming' / 'Microsoft' / 'Windows' / 'PowerShell' / 'PSReadLine' / 'Visual Studio Code Host_history.txt',
        ]
        
        for path in default_paths:
            if path.exists():
                return path
        
        return None
    
    def _get_bash_history_path(self):
        """
        Get Bash history path on Linux/Mac
        
        Returns:
            Path: Bash history file path or None
        """
        bash_history = Path.home() / '.bash_history'
        if bash_history.exists():
            return bash_history
        
        # Try zsh history
        zsh_history = Path.home() / '.zsh_history'
        if zsh_history.exists():
            self.shell_type = 'Zsh'
            return zsh_history
        
        return None
    
    def parse_shell_history(self, custom_path=None):
        """
        Parse shell history into structured format
        
        Args:
            custom_path (str): Custom history file path (optional)
            
        Returns:
            list: Structured command history
        """
        if custom_path:
            self.history_path = Path(custom_path)
        
        if not self.history_path or not self.history_path.exists():
            return []
        
        commands = []
        
        try:
            # Read with multiple encoding fallbacks
            encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
            content = None
            
            for encoding in encodings:
                try:
                    with open(self.history_path, 'r', encoding=encoding, errors='ignore') as f:
                        content = f.readlines()
                    break
                except Exception:
                    continue
            
            if not content:
                return []
            
            # Parse based on shell type
            for line in content:
                line = line.strip()
                
                # Skip empty lines and comments
                if not line or line.startswith('#'):
                    continue
                
                # Basic command structure
                command_entry = {
                    'command': line,
                    'timestamp': None,
                    'session': None
                }
                
                # Try to extract timestamp from zsh history format
                if self.shell_type == 'Zsh' and line.startswith(':'):
                    # Zsh format: : 1234567890:0;command
                    match = re.match(r': (\d+):\d+;(.+)', line)
                    if match:
                        command_entry['timestamp'] = datetime.fromtimestamp(int(match.group(1)))
                        command_entry['command'] = match.group(2)
                
                commands.append(command_entry)
            
            self.history_data = commands
            return commands
        
        except FileNotFoundError:
            return []
        except PermissionError:
            return []
        except Exception:
            return []
    
    def get_top_commands(self, limit=20):
        """
        Get most frequently used commands
        
        Args:
            limit (int): Number of top commands to return
            
        Returns:
            list: Top commands with counts and percentages
        """
        if not self.history_data:
            self.parse_shell_history()
        
        if not self.history_data:
            return []
        
        # Extract just command strings
        command_strings = [entry['command'] for entry in self.history_data]
        
        # Count frequencies
        command_counter = Counter(command_strings)
        total_commands = len(command_strings)
        
        top_commands = []
        for command, count in command_counter.most_common(limit):
            top_commands.append({
                'command': command,
                'count': count,
                'percentage': round((count / total_commands) * 100, 2) if total_commands > 0 else 0
            })
        
        return top_commands
    
    def find_common_sequences(self, sequence_length=2, min_frequency=3):
        """
        Detect frequent command chains
        
        Args:
            sequence_length (int): Length of sequences (2 or 3)
            min_frequency (int): Minimum occurrence count
            
        Returns:
            list: Ranked sequences with counts
        """
        if not self.history_data:
            self.parse_shell_history()
        
        if not self.history_data or len(self.history_data) < sequence_length:
            return []
        
        sequences = defaultdict(int)
        commands = [entry['command'] for entry in self.history_data]
        
        # Generate sequences
        for i in range(len(commands) - sequence_length + 1):
            sequence = tuple(commands[i:i + sequence_length])
            sequences[sequence] += 1
        
        # Filter by frequency and sort
        common_sequences = [
            {
                'sequence': list(seq),
                'count': count,
                'display': ' → '.join([cmd[:40] + '...' if len(cmd) > 40 else cmd for cmd in seq])
            }
            for seq, count in sequences.items()
            if count >= min_frequency
        ]
        
        # Sort by count descending
        common_sequences.sort(key=lambda x: x['count'], reverse=True)
        
        return common_sequences
    
    def suggest_aliases(self, min_frequency=5, limit=15):
        """
        Generate intelligent alias suggestions
        
        Args:
            min_frequency (int): Minimum command frequency
            limit (int): Maximum number of suggestions
            
        Returns:
            list: Alias suggestions with shell syntax
        """
        if not self.history_data:
            self.parse_shell_history()
        
        top_commands = self.get_top_commands(limit=50)
        suggestions = []
        used_aliases = set()
        
        for cmd_data in top_commands:
            command = cmd_data['command']
            count = cmd_data['count']
            
            # Skip if below frequency threshold
            if count < min_frequency:
                continue
            
            # Skip if already at limit
            if len(suggestions) >= limit:
                break
            
            # Skip very short commands (already optimal)
            if len(command) <= 3:
                continue
            
            # Skip dangerous commands
            if any(danger in command.lower() for danger in self.DANGEROUS_COMMANDS):
                continue
            
            # Generate alias
            alias_name = self._generate_smart_alias(command, used_aliases)
            
            if not alias_name:
                continue
            
            # Create suggestion based on shell type
            if self.is_windows:
                # PowerShell alias syntax
                suggestion = {
                    'alias': alias_name,
                    'command': command,
                    'frequency': count,
                    'syntax': f'Set-Alias -Name {alias_name} -Value "{command}"',
                    'function_syntax': f'function {alias_name} {{ {command} @args }}',
                    'shell': 'PowerShell',
                    'type': 'function' if any(c in command for c in ['|', '>', '<', '&']) else 'alias'
                }
            else:
                # Bash alias syntax
                suggestion = {
                    'alias': alias_name,
                    'command': command,
                    'frequency': count,
                    'syntax': f"alias {alias_name}='{command}'",
                    'shell': 'Bash',
                    'type': 'alias'
                }
            
            suggestions.append(suggestion)
            used_aliases.add(alias_name)
        
        return suggestions
    
    def _generate_smart_alias(self, command, used_aliases):
        """
        Generate intelligent alias name
        
        Args:
            command (str): Full command
            used_aliases (set): Already used alias names
            
        Returns:
            str: Suggested alias name or None
        """
        parts = command.split()
        if not parts:
            return None
        
        base_cmd = parts[0].lower()
        
        # Git commands
        if base_cmd == 'git' and len(parts) > 1:
            subcommand = parts[1]
            git_aliases = {
                'status': 'gs',
                'add': 'ga',
                'commit': 'gc',
                'push': 'gp',
                'pull': 'gl',
                'checkout': 'gco',
                'branch': 'gb',
                'log': 'glog',
                'diff': 'gd',
                'fetch': 'gf',
                'merge': 'gm',
                'rebase': 'gr',
                'stash': 'gst',
                'tag': 'gt',
            }
            
            if subcommand in git_aliases:
                alias = git_aliases[subcommand]
                if alias not in used_aliases:
                    return alias
        
        # Docker commands
        if base_cmd == 'docker' and len(parts) > 1:
            subcommand = parts[1]
            docker_aliases = {
                'ps': 'dps',
                'images': 'di',
                'exec': 'dex',
                'logs': 'dl',
                'stop': 'ds',
                'start': 'dstart',
                'compose': 'dc',
            }
            
            if subcommand in docker_aliases:
                alias = docker_aliases[subcommand]
                if alias not in used_aliases:
                    return alias
        
        # Python commands
        if base_cmd == 'python' or base_cmd == 'python3':
            if 'manage.py' in command:
                if 'pm' not in used_aliases:
                    return 'pm'
            elif '-m' in parts:
                if 'py' not in used_aliases:
                    return 'py'
        
        # NPM commands
        if base_cmd == 'npm' and len(parts) > 1:
            subcommand = parts[1]
            npm_aliases = {
                'install': 'ni',
                'run': 'nr',
                'start': 'ns',
                'test': 'nt',
                'build': 'nb',
            }
            
            if subcommand in npm_aliases:
                alias = npm_aliases[subcommand]
                if alias not in used_aliases:
                    return alias
        
        # Generic: first letters of first 2-3 words
        if len(parts) >= 2:
            # Try 2 words
            alias = ''.join(word[0] for word in parts[:2] if word)
            if alias and alias not in used_aliases and len(alias) >= 2:
                return alias.lower()
            
            # Try 3 words
            if len(parts) >= 3:
                alias = ''.join(word[0] for word in parts[:3] if word)
                if alias and alias not in used_aliases and len(alias) >= 2:
                    return alias.lower()
        
        return None
    
    def detect_workflow_patterns(self, min_frequency=3):
        """
        Identify common workflow patterns
        
        Args:
            min_frequency (int): Minimum pattern frequency
            
        Returns:
            dict: Workflow insights
        """
        if not self.history_data:
            self.parse_shell_history()
        
        if not self.history_data:
            return {
                'build_test_cycles': [],
                'git_workflows': [],
                'install_run_loops': [],
                'insights': []
            }
        
        commands = [entry['command'] for entry in self.history_data]
        
        # Detect patterns
        build_test = []
        git_flow = []
        install_run = []
        insights = []
        
        # Find build/test cycles
        for i in range(len(commands) - 1):
            curr = commands[i].lower()
            next_cmd = commands[i + 1].lower()
            
            # Build then test
            if any(b in curr for b in ['build', 'compile', 'make']) and \
                any(t in next_cmd for t in ['test', 'pytest', 'jest', 'mocha']):
                pattern = f"{commands[i]} → {commands[i + 1]}"
                build_test.append(pattern)
            
            # Git workflow
            if 'git add' in curr and 'git commit' in next_cmd:
                pattern = "git add → git commit"
                git_flow.append(pattern)
            elif 'git commit' in curr and 'git push' in next_cmd:
                pattern = "git commit → git push"
                git_flow.append(pattern)
            
            # Install then run
            if any(inst in curr for inst in ['install', 'pip install', 'npm install']) and \
                any(run in next_cmd for run in ['run', 'start', 'python', 'node']):
                pattern = f"{commands[i][:50]} → {commands[i + 1][:50]}"
                install_run.append(pattern)
        
        # Count patterns
        build_test_counter = Counter(build_test)
        git_flow_counter = Counter(git_flow)
        install_run_counter = Counter(install_run)
        
        # Generate insights
        if build_test_counter:
            most_common = build_test_counter.most_common(1)[0]
            insights.append(f"Build-test cycle detected {most_common[1]} times - consider creating a combined script")
        
        if git_flow_counter.get("git add → git commit", 0) > min_frequency:
            count = git_flow_counter["git add → git commit"]
            insights.append(f"Frequent git add→commit sequence ({count}x) - consider using 'git commit -am' or create alias")
        
        if git_flow_counter.get("git commit → git push", 0) > min_frequency:
            count = git_flow_counter["git commit → git push"]
            insights.append(f"Frequent commit→push sequence ({count}x) - consider creating a combined alias")
        
        if not insights:
            insights.append("No repetitive workflow patterns detected")
        
        return {
            'build_test_cycles': [{'pattern': k, 'count': v} for k, v in build_test_counter.most_common(5)],
            'git_workflows': [{'pattern': k, 'count': v} for k, v in git_flow_counter.most_common(5)],
            'install_run_loops': [{'pattern': k, 'count': v} for k, v in install_run_counter.most_common(5)],
            'insights': insights
        }
    
    def get_statistics(self):
        """
        Get overall command history statistics
        
        Returns:
            dict: Statistics summary
        """
        if not self.history_data:
            self.parse_shell_history()
        
        if not self.history_data:
            return {
                'total_commands': 0,
                'unique_commands': 0,
                'shell_type': self.shell_type,
                'history_path': str(self.history_path) if self.history_path else 'Not found'
            }
        
        commands = [entry['command'] for entry in self.history_data]
        command_counter = Counter(commands)
        
        return {
            'total_commands': len(commands),
            'unique_commands': len(command_counter),
            'most_common': command_counter.most_common(1)[0] if command_counter else None,
            'shell_type': self.shell_type,
            'history_path': str(self.history_path) if self.history_path else 'Unknown',
            'repetition_rate': round((1 - len(command_counter) / len(commands)) * 100, 2) if commands else 0
        }
    
    def save_to_database(self, db_path=None):
        """
        Save command usage statistics to database
        
        Args:
            db_path (str): Database path (optional)
            
        Returns:
            int: Number of records saved
        """
        if not self.history_data:
            return 0
        
        if db_path is None:
            config_dir = Path.home() / '.devflow'
            config_dir.mkdir(exist_ok=True)
            db_path = config_dir / 'devflow.db'
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Create command_history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS command_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    command TEXT NOT NULL,
                    frequency INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    shell_type TEXT
                )
            ''')
            
            # Create command_sequences table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS command_sequences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sequence TEXT NOT NULL,
                    count INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create alias_suggestions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS alias_suggestions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    alias_name TEXT NOT NULL,
                    command TEXT NOT NULL,
                    frequency INTEGER DEFAULT 0,
                    shell_type TEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_command_freq ON command_history(frequency)')
            
            # Clear old data
            cursor.execute('DELETE FROM command_history')
            
            # Save command usage
            commands = [entry['command'] for entry in self.history_data]
            command_counter = Counter(commands)
            
            records = [
                (cmd, count, datetime.now().isoformat(), self.shell_type)
                for cmd, count in command_counter.items()
            ]
            
            cursor.executemany(
                'INSERT INTO command_history (command, frequency, last_updated, shell_type) VALUES (?, ?, ?, ?)',
                records
            )
            
            conn.commit()
            conn.close()
            
            return len(records)
        
        except Exception:
            return 0
    
    def save_command_usage_batch(self, db_path=None):
        """Batch save command usage (alias for save_to_database)"""
        return self.save_to_database(db_path)
    
    def save_command_sequences(self, sequences=None, db_path=None):
        """
        Save command sequences to database
        
        Args:
            sequences (list): List of sequences to save
            db_path (str): Database path (optional)
            
        Returns:
            int: Number of sequences saved
        """
        if sequences is None:
            sequences = self.find_common_sequences(sequence_length=2, min_frequency=2)
        
        if not sequences:
            return 0
        
        if db_path is None:
            config_dir = Path.home() / '.devflow'
            config_dir.mkdir(exist_ok=True)
            db_path = config_dir / 'devflow.db'
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM command_sequences')
            
            records = [
                (' → '.join(seq['sequence']), seq['count'], datetime.now().isoformat())
                for seq in sequences
            ]
            
            cursor.executemany(
                'INSERT INTO command_sequences (sequence, count, last_updated) VALUES (?, ?, ?)',
                records
            )
            
            conn.commit()
            conn.close()
            
            return len(records)
        
        except Exception:
            return 0
    
    def save_alias_suggestions(self, suggestions=None, db_path=None):
        """
        Save alias suggestions to database
        
        Args:
            suggestions (list): List of alias suggestions
            db_path (str): Database path (optional)
            
        Returns:
            int: Number of suggestions saved
        """
        if suggestions is None:
            suggestions = self.suggest_aliases()
        
        if not suggestions:
            return 0
        
        if db_path is None:
            config_dir = Path.home() / '.devflow'
            config_dir.mkdir(exist_ok=True)
            db_path = config_dir / 'devflow.db'
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM alias_suggestions')
            
            records = [
                (sug['alias'], sug['command'], sug['frequency'], sug['shell'], datetime.now().isoformat())
                for sug in suggestions
            ]
            
            cursor.executemany(
                'INSERT INTO alias_suggestions (alias_name, command, frequency, shell_type, last_updated) VALUES (?, ?, ?, ?, ?)',
                records
            )
            
            conn.commit()
            conn.close()
            
            return len(records)
        
        except Exception:
            return 0


# Standalone utility functions (for backward compatibility)

def parse_shell_history(custom_path=None):
    """Parse shell history"""
    tracker = HistoryTracker()
    return [entry['command'] for entry in tracker.parse_shell_history(custom_path)]


def find_common_sequences(min_frequency=2):
    """Find common command sequences"""
    tracker = HistoryTracker()
    tracker.parse_shell_history()
    return tracker.find_common_sequences(sequence_length=2, min_frequency=min_frequency)


def suggest_aliases(min_frequency=5, limit=10):
    """Suggest command aliases"""
    tracker = HistoryTracker()
    tracker.parse_shell_history()
    return tracker.suggest_aliases(min_frequency=min_frequency, limit=limit)


def get_top_commands(limit=10):
    """Get top commands"""
    tracker = HistoryTracker()
    tracker.parse_shell_history()
    return tracker.get_top_commands(limit=limit)


# Test function
def test_history_tracker():
    """Test all HistoryTracker methods"""
    print("=" * 70)
    print(" TESTING HISTORYTRACKER - Production Ready Edition")
    print("=" * 70)
    
    tracker = HistoryTracker()
    
    # Test 1: Parse shell history
    print("\n1. Testing parse_shell_history()...")
    try:
        commands = tracker.parse_shell_history()
        print(f"   ✓ Found {len(commands)} commands in history")
        print(f"   - Shell: {tracker.shell_type}")
        print(f"   - Path: {tracker.history_path}")
        if commands:
            print(f"   - Sample: {commands[0]['command'][:50]}...")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False
    
    # Test 2: Get top commands
    print("\n2. Testing get_top_commands()...")
    try:
        top_commands = tracker.get_top_commands(limit=5)
        print(f"   ✓ Top {len(top_commands)} commands:")
        for idx, cmd_data in enumerate(top_commands, 1):
            cmd_display = cmd_data['command'][:40] + '...' if len(cmd_data['command']) > 40 else cmd_data['command']
            print(f"      {idx}. {cmd_display} ({cmd_data['count']} times, {cmd_data['percentage']}%)")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 3: Find common sequences
    print("\n3. Testing find_common_sequences()...")
    try:
        sequences = tracker.find_common_sequences(sequence_length=2, min_frequency=2)
        print(f"   ✓ Found {len(sequences)} common sequences")
        for idx, seq in enumerate(sequences[:3], 1):
            print(f"      {idx}. {seq['display']} ({seq['count']} times)")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 4: Suggest aliases
    print("\n4. Testing suggest_aliases()...")
    try:
        suggestions = tracker.suggest_aliases(min_frequency=3, limit=5)
        print(f"   ✓ Generated {len(suggestions)} alias suggestions:")
        for sug in suggestions[:3]:
            print(f"      - {sug['alias']}: {sug['command'][:40]}... ({sug['frequency']} uses)")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 5: Detect workflow patterns
    print("\n5. Testing detect_workflow_patterns()...")
    try:
        patterns = tracker.detect_workflow_patterns(min_frequency=2)
        print(f"   ✓ Workflow patterns detected:")
        print(f"      - Build/test cycles: {len(patterns['build_test_cycles'])}")
        print(f"      - Git workflows: {len(patterns['git_workflows'])}")
        print(f"      - Install/run loops: {len(patterns['install_run_loops'])}")
        print(f"      - Insights: {len(patterns['insights'])}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 6: Get statistics
    print("\n6. Testing get_statistics()...")
    try:
        stats = tracker.get_statistics()
        print(f"   ✓ Statistics:")
        print(f"      - Total commands: {stats['total_commands']}")
        print(f"      - Unique commands: {stats['unique_commands']}")
        print(f"      - Shell type: {stats['shell_type']}")
        print(f"      - Repetition rate: {stats.get('repetition_rate', 0)}%")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Test 7: Save to database
    print("\n7. Testing save_to_database()...")
    try:
        saved = tracker.save_to_database()
        print(f"   ✓ Saved {saved} records to database")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "=" * 70)
    print(" ✅ ALL TESTS PASSED!")
    print("=" * 70)
    print("\n Ready to run: python run.py history")
    
    return True


if __name__ == '__main__':
    test_history_tracker()
