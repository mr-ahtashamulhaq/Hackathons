#!/usr/bin/env python3
"""
DevFlow CLI - A developer productivity tool for git analysis and workflow tracking
"""

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.live import Live
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.text import Text
import os
import json
from pathlib import Path
from datetime import datetime

from .git_analyzer import GitAnalyzer
from .database import save_commit_analysis, save_file_hotspots
from .history import HistoryTracker
from .exporter import AnalyticsExporter
from .demo import DemoManager
from collections import Counter

console = Console()

CONFIG_DIR = Path.home() / '.devflow'
CONFIG_FILE = CONFIG_DIR / 'config.json'
HISTORY_FILE = CONFIG_DIR / 'history.json'


@click.group()
@click.version_option(version='1.0.0')
def cli():
    """DevFlow - Developer productivity and git workflow analysis tool"""
    pass


@cli.command()
@click.option('--path', default='.', help='Repository path to initialize')
@click.option('--force', is_flag=True, help='Force reinitialization')
def init(path, force):
    """Initialize DevFlow in the current repository"""
    console.print(Panel.fit("🚀 [bold blue]DevFlow Initialization[/bold blue]", border_style="blue"))
    
    if CONFIG_DIR.exists() and not force:
        console.print("[yellow]DevFlow is already initialized. Use --force to reinitialize.[/yellow]")
        return
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Initializing DevFlow...", total=None)
        
        # Create config directory
        CONFIG_DIR.mkdir(exist_ok=True)
        
        # Create initial config
        config = {
            'initialized': datetime.now().isoformat(),
            'repository_path': os.path.abspath(path),
            'version': '1.0.0'
        }
        
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        
        # Create history file
        history = {
            'commands': [],
            'created': datetime.now().isoformat()
        }
        
        with open(HISTORY_FILE, 'w') as f:
            json.dump(history, f, indent=2)
        
        progress.update(task, completed=True)
    
    console.print("[green]✓[/green] DevFlow initialized successfully!")
    console.print(f"[dim]Config directory: {CONFIG_DIR}[/dim]")


@cli.command()
@click.option('--repo', default='.', help='Path to git repository')
@click.option('--author', help='Filter by author name')
@click.option('--days', default=30, help='Number of days to analyze')
@click.option('--limit', default=100, help='Number of commits to analyze')
def analyze(repo, author, days, limit):
    """Analyze git commit history and patterns"""
    console.print(Panel.fit("📊 [bold cyan]Git Commit Analysis[/bold cyan]", border_style="cyan"))
    
    # Track command in history
    _track_command('analyze', {'repo': repo, 'author': author, 'days': days, 'limit': limit})
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            # Initialize GitAnalyzer
            task = progress.add_task("Initializing analyzer...", total=None)
            try:
                analyzer = GitAnalyzer(repo)
            except ValueError as e:
                console.print(f"\n[red]Error:[/red] {str(e)}")
                console.print("\n[yellow]Make sure you're in a git repository or provide a valid path.[/yellow]")
                return
            
            # Get commit history
            progress.update(task, description=f"Fetching commit history (last {days} days)...")
            commits = analyzer.get_commit_history(days=days, author=author)
            
            if not commits:
                console.print("\n[yellow]No commits found for the specified criteria.[/yellow]")
                console.print("[dim]Try increasing the --days parameter or removing author filter.[/dim]")
                return
            
            # Save to database
            progress.update(task, description="Saving commits to database...")
            from .database import Database
            db = Database()
            saved = db.save_commit_batch(commits[:limit])
            
            # Get commit patterns
            progress.update(task, description="Analyzing commit patterns...")
            patterns = analyzer.analyze_commit_patterns(days=days, author=author)
            
            # Get hotspot files
            progress.update(task, description="Analyzing file hotspots...")
            hotspots = analyzer.get_hotspot_files(days=days, limit=10, author=author)
            
            # Save hotspots to database
            if hotspots:
                progress.update(task, description="Saving hotspot data...")
                hotspot_data = [
                    {
                        'file': file_path,
                        'changes': change_count,
                        'insertions': 0,
                        'deletions': 0,
                        'risk_level': 'critical' if change_count > 15 else 'high' if change_count > 10 else 'medium' if change_count > 5 else 'low',
                        'unique_authors': 0,
                        'authors': []
                    }
                    for file_path, change_count, _ in hotspots
                ]
                db.save_hotspot_batch(hotspot_data, days_analyzed=days)
            
            # Generate productivity score
            progress.update(task, description="Calculating productivity score...")
            productivity = analyzer.generate_productivity_score(days=days)
            db.save_productivity_score({**productivity, 'days_analyzed': days})
        
        # Display results with rich formatting
        console.print(f"\n[bold]Repository:[/bold] {os.path.abspath(repo)}")
        if author:
            console.print(f"[bold]Author Filter:[/bold] {author}")
        console.print(f"[bold]Analysis Period:[/bold] Last {days} days")
        console.print(f"[bold]Default Branch:[/bold] {analyzer.default_branch}\n")
        
        # === SUMMARY TABLE ===
        summary_table = Table(title="📈 Commit Summary", show_header=True, header_style="bold magenta", border_style="cyan")
        summary_table.add_column("Metric", style="cyan", width=30)
        summary_table.add_column("Value", justify="right", style="green", width=20)
        
        total_files = sum(c['files_changed'] for c in commits)
        total_insertions = sum(c['insertions'] for c in commits)
        total_deletions = sum(c['deletions'] for c in commits)
        
        summary_table.add_row("Total Commits", f"[bold]{len(commits)}[/bold]")
        summary_table.add_row("Unique Authors", f"{len(patterns['top_authors'])}")
        summary_table.add_row("Files Changed", f"{total_files:,}")
        summary_table.add_row("Lines Added", f"[green]+{total_insertions:,}[/green]")
        summary_table.add_row("Lines Deleted", f"[red]-{total_deletions:,}[/red]")
        summary_table.add_row("Net Change", f"{total_insertions - total_deletions:+,}")
        summary_table.add_row("Avg Message Length", f"{patterns['average_commit_message_length']:.0f} chars")
        
        console.print(summary_table)
        
        # === TOP CONTRIBUTORS ===
        if patterns['top_authors']:
            console.print("\n[bold cyan]👥 Top Contributors:[/bold cyan]")
            contrib_table = Table(show_header=True, header_style="bold yellow", border_style="blue")
            contrib_table.add_column("Rank", justify="right", style="dim", width=6)
            contrib_table.add_column("Author", style="yellow", width=30)
            contrib_table.add_column("Commits", justify="right", style="green", width=10)
            contrib_table.add_column("%", justify="right", style="magenta", width=8)
            
            for idx, author_data in enumerate(patterns['top_authors'][:3], 1):
                contrib_table.add_row(
                    f"#{idx}",
                    author_data['name'],
                    str(author_data['commits']),
                    f"{author_data['percentage']}%"
                )
            
            console.print(contrib_table)
        
        # === COMMIT HEAT SUMMARY ===
        console.print("\n[bold cyan]🔥 Commit Heat Summary:[/bold cyan]")
        heat_table = Table(show_header=True, header_style="bold green", border_style="yellow")
        heat_table.add_column("Period", style="cyan", width=20)
        heat_table.add_column("Activity", style="yellow")
        
        # Show busiest day
        if patterns['commits_per_day']:
            busiest_day = max(patterns['commits_per_day'].items(), key=lambda x: x[1])
            heat_table.add_row("Busiest Day", f"{busiest_day[0]} ({busiest_day[1]} commits)")
        
        # Show busiest hour
        if patterns['commits_per_hour']:
            busiest_hour = max(patterns['commits_per_hour'].items(), key=lambda x: x[1])
            hour_str = f"{busiest_hour[0]:02d}:00"
            heat_table.add_row("Busiest Hour", f"{hour_str} ({busiest_hour[1]} commits)")
        
        heat_table.add_row("Workday Activity", f"{patterns['workday_percentage']}%")
        heat_table.add_row("Weekend Activity", f"{patterns['weekend_percentage']}%")
        
        console.print(heat_table)
        
        # === HOTSPOT FILES ===
        if hotspots:
            console.print("\n[bold red]🔥 Top Hotspot Files:[/bold red]")
            hotspot_table = Table(show_header=True, header_style="bold red", border_style="red")
            hotspot_table.add_column("Rank", justify="right", style="dim", width=6)
            hotspot_table.add_column("File", style="yellow", width=50)
            hotspot_table.add_column("Changes", justify="right", style="red", width=10)
            hotspot_table.add_column("Lines", justify="right", style="magenta", width=10)
            hotspot_table.add_column("Risk", style="bold", width=10)
            
            for idx, (file_path, change_count, lines_changed) in enumerate(hotspots[:5], 1):
                if change_count > 15:
                    risk = "[red]CRITICAL[/red]"
                elif change_count > 10:
                    risk = "[bold red]HIGH[/bold red]"
                elif change_count > 5:
                    risk = "[yellow]MEDIUM[/yellow]"
                else:
                    risk = "[green]LOW[/green]"
                
                # Truncate long file paths
                display_path = file_path if len(file_path) <= 50 else "..." + file_path[-47:]
                
                hotspot_table.add_row(
                    f"#{idx}",
                    display_path,
                    str(change_count),
                    f"{lines_changed:,}",
                    risk
                )
            
            console.print(hotspot_table)
        
        # === PRODUCTIVITY SCORE ===
        console.print("\n")
        score_color = "green" if productivity['score'] >= 70 else "yellow" if productivity['score'] >= 50 else "red"
        grade_display = f"[bold {score_color}]{productivity['grade']}[/bold {score_color}]"
        
        prod_panel = Panel(
            f"[bold]Overall Score:[/bold] [{score_color}]{productivity['score']:.1f}/100[/{score_color}] ({grade_display})\n\n"
            f"[cyan]• Commit Frequency:[/cyan] {productivity['commit_frequency_score']:.1f}/40 "
            f"([dim]{productivity.get('average_daily_commits', 0):.1f} commits/day[/dim])\n"
            f"[cyan]• Code Quality:[/cyan] {productivity['quality_score']:.1f}/30 "
            f"([dim]{productivity.get('average_quality', 0):.0f}% avg quality[/dim])\n"
            f"[cyan]• Work Distribution:[/cyan] {productivity['distribution_score']:.1f}/30 "
            f"([dim]{productivity.get('work_hour_percentage', 0):.0f}% work hours[/dim])\n\n"
            f"[yellow]💡 Insights:[/yellow]\n" +
            "\n".join([f"  • {insight}" for insight in productivity['insights']]),
            title="📊 Productivity Score",
            border_style="green" if productivity['score'] >= 70 else "yellow",
            padding=(1, 2)
        )
        
        console.print(prod_panel)
        
        console.print(f"\n[green]✓[/green] Analysis complete! Saved {saved} commits to database.")
        
    except ValueError as e:
        console.print(f"\n[red]Error:[/red] {str(e)}")
    except Exception as e:
        console.print(f"\n[red]Unexpected error:[/red] {str(e)}")
        import traceback
        traceback.print_exc()


@cli.command()
@click.option('--refresh', default=5, help='Dashboard refresh interval in seconds')
@click.option('--mode', type=click.Choice(['live', 'static']), default='static', help='Display mode')
def dashboard(refresh, mode):
    """Display terminal dashboard with development metrics"""
    console.print(Panel.fit("📈 [bold green]DevFlow Dashboard[/bold green]", border_style="green"))
    
    # Track command in history
    _track_command('dashboard', {'refresh': refresh, 'mode': mode})
    
    layout = Layout()
    
    # Create dashboard sections
    layout.split_column(
        Layout(name="header", size=3),
        Layout(name="body"),
        Layout(name="footer", size=3)
    )
    
    layout["header"].update(Panel("[bold blue]DevFlow Dashboard[/bold blue] - Real-time Development Metrics", style="white on blue"))
    
    # Body with metrics
    body_table = Table(show_header=True, header_style="bold cyan")
    body_table.add_column("Metric", style="cyan", width=40)
    body_table.add_column("Value", justify="right", style="green")
    
    body_table.add_row("Today's Commits", "0")
    body_table.add_row("Active Branches", "0")
    body_table.add_row("Lines of Code", "0")
    body_table.add_row("Last Commit", "N/A")
    
    layout["body"].update(Panel(body_table, title="Metrics", border_style="cyan"))
    layout["footer"].update(Panel(f"[dim]Mode: {mode} | Refresh: {refresh}s | Press Ctrl+C to exit[/dim]", style="white on black"))
    
    console.print(layout)
    console.print("\n[yellow]ℹ  Live dashboard implementation pending[/yellow]")


@cli.command()
@click.option('--limit', default=10, help='Number of recent commands to show')
@click.option('--clear', is_flag=True, help='Clear command history')
@click.option('--suggest-aliases', is_flag=True, help='Show only alias suggestions')
@click.option('--patterns', is_flag=True, help='Show only workflow patterns')
def history(limit, clear, suggest_aliases, patterns):
    """View or manage command execution history"""
    
    if clear:
        console.print(Panel.fit("🗑️  [bold red]Clear History[/bold red]", border_style="red"))
        if HISTORY_FILE.exists():
            history_data = {
                'commands': [],
                'created': datetime.now().isoformat()
            }
            with open(HISTORY_FILE, 'w') as f:
                json.dump(history_data, f, indent=2)
            console.print("[green]✓[/green] DevFlow history cleared!")
        return
    
    # If patterns flag is set, only show workflow patterns
    if patterns:
        console.print(Panel.fit("🔄 [bold green]Workflow Patterns[/bold green]", border_style="green"))
        
        try:
            tracker = HistoryTracker()
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console
            ) as progress:
                task = progress.add_task("Analyzing workflow patterns...", total=None)
                tracker.parse_shell_history()
                workflow_patterns = tracker.detect_workflow_patterns(min_frequency=2)
            
            # Display workflow insights
            if not any([workflow_patterns['build_test_cycles'], 
                       workflow_patterns['git_workflows'], 
                       workflow_patterns['install_run_loops']]):
                console.print("\n[yellow]No significant workflow patterns detected.[/yellow]")
                return
            
            # Build/test cycles
            if workflow_patterns['build_test_cycles']:
                console.print("\n[bold cyan]🏗️  Build/Test Cycles:[/bold cyan]")
                for item in workflow_patterns['build_test_cycles'][:5]:
                    console.print(f"  • {item['pattern']} ([bold]{item['count']}x[/bold])")
            
            # Git workflows
            if workflow_patterns['git_workflows']:
                console.print("\n[bold yellow]📦 Git Workflows:[/bold yellow]")
                for item in workflow_patterns['git_workflows'][:5]:
                    console.print(f"  • {item['pattern']} ([bold]{item['count']}x[/bold])")
            
            # Install/run loops
            if workflow_patterns['install_run_loops']:
                console.print("\n[bold magenta]⚙️  Install/Run Loops:[/bold magenta]")
                for item in workflow_patterns['install_run_loops'][:5]:
                    console.print(f"  • {item['pattern']} ([bold]{item['count']}x[/bold])")
            
            # Insights panel
            insights_text = "\n".join([f"• {insight}" for insight in workflow_patterns['insights']])
            panel = Panel(
                insights_text,
                title="💡 Insights & Recommendations",
                border_style="blue",
                padding=(1, 2)
            )
            console.print("\n", panel)
            
        except Exception as e:
            console.print(f"\n[red]Error analyzing patterns:[/red] {str(e)}")
        
        return
    
    # If suggest-aliases flag is set, only show alias suggestions
    if suggest_aliases:
        console.print(Panel.fit("💡 [bold blue]Alias Suggestions[/bold blue]", border_style="blue"))
        
        try:
            tracker = HistoryTracker()
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console
            ) as progress:
                task = progress.add_task("Analyzing shell history...", total=None)
                tracker.parse_shell_history()
                progress.update(task, description="Generating suggestions...")
                suggestions = tracker.suggest_aliases(min_frequency=3, limit=10)
            
            if not suggestions:
                console.print("\n[yellow]No alias suggestions found. Try running more commands![/yellow]")
                return
            
            # Display suggestions in a table
            table = Table(title="Suggested Aliases", show_header=True, header_style="bold cyan")
            table.add_column("Alias", style="green", width=15)
            table.add_column("Command", style="yellow", width=40)
            table.add_column("Used", justify="right", style="magenta", width=10)
            table.add_column("Shell Syntax", style="blue")
            
            for suggestion in suggestions:
                table.add_row(
                    suggestion['alias'],
                    suggestion['command'][:40] + ('...' if len(suggestion['command']) > 40 else ''),
                    str(suggestion['frequency']),
                    suggestion['syntax'][:50] + ('...' if len(suggestion['syntax']) > 50 else '')
                )
            
            console.print("\n", table)
            console.print(f"\n[dim]💡 Copy the syntax to your shell profile to enable these aliases[/dim]")
            
        except Exception as e:
            console.print(f"\n[red]Error analyzing history:[/red] {str(e)}")
        
        return
    
    # Full history analysis
    console.print(Panel.fit("📜 [bold magenta]Command History Analysis[/bold magenta]", border_style="magenta"))
    
    try:
        tracker = HistoryTracker()
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Parsing shell history...", total=None)
            commands = tracker.parse_shell_history()
            
            if not commands:
                console.print("\n[yellow]No shell history found.[/yellow]")
                console.print("[dim]History might be empty or not accessible.[/dim]")
                return
            
            progress.update(task, description="Analyzing patterns...")
            top_commands = tracker.get_top_commands(limit=limit)
            sequences = tracker.find_common_sequences(sequence_length=2, min_frequency=2)
            suggestions = tracker.suggest_aliases(min_frequency=3, limit=5)
            stats = tracker.get_statistics()
        
        # Display statistics
        console.print(f"\n[bold]Shell Type:[/bold] {stats['shell_type']}")
        console.print(f"[bold]Total Commands:[/bold] {stats['total_commands']:,}")
        console.print(f"[bold]Unique Commands:[/bold] {stats['unique_commands']:,}")
        console.print(f"[bold]Repetition Rate:[/bold] {stats['repetition_rate']}%\n")
        
        # Top commands table
        if top_commands:
            table = Table(title=f"🏆 Top {limit} Commands", show_header=True, header_style="bold cyan")
            table.add_column("Rank", justify="right", style="dim", width=6)
            table.add_column("Command", style="yellow", width=50)
            table.add_column("Count", justify="right", style="green", width=10)
            table.add_column("%", justify="right", style="magenta", width=8)
            
            for idx, cmd_data in enumerate(top_commands, 1):
                rank_style = "bold green" if idx == 1 else "bold yellow" if idx == 2 else "bold"
                cmd_text = cmd_data['command']
                if len(cmd_text) > 50:
                    cmd_text = cmd_text[:47] + "..."
                
                table.add_row(
                    f"#{idx}",
                    cmd_text,
                    str(cmd_data['count']),
                    f"{cmd_data['percentage']}%"
                )
            
            console.print(table)
        
        # Command sequences
        if sequences:
            console.print("\n[bold cyan]🔄 Top 5 Command Sequences:[/bold cyan]")
            for idx, seq_data in enumerate(sequences[:5], 1):
                console.print(f"  {idx}. [yellow]{seq_data['display']}[/yellow]")
                console.print(f"      Repeated [bold]{seq_data['count']}[/bold] times")
        
        # Alias suggestions panel
        if suggestions:
            alias_text = "\n".join([
                f"[green]{s['alias']}[/green]: {s['command'][:40]}{'...' if len(s['command']) > 40 else ''} ([dim]{s['frequency']} uses[/dim])"
                for s in suggestions
            ])
            
            panel = Panel(
                alias_text,
                title="💡 Suggested Aliases",
                border_style="blue",
                padding=(1, 2)
            )
            console.print("\n", panel)
            console.print("[dim]Run with --suggest-aliases to see full alias syntax[/dim]")
        
        # Save to database
        try:
            saved = tracker.save_to_database()
            if saved > 0:
                console.print(f"\n[green]✓[/green] Saved {saved} command records to database")
        except Exception:
            pass
        
    except Exception as e:
        console.print(f"\n[red]Error:[/red] {str(e)}")
        import traceback
        traceback.print_exc()


@cli.command()
@click.option('--output', help='Output directory for JSON files')
@click.option('--days', default=30, help='Number of days to analyze')
@click.option('--repo', default='.', help='Repository path')
def export(output, days, repo):
    """Export analytics data to JSON files for frontend"""
    console.print(Panel.fit("📤 [bold blue]Export Analytics[/bold blue]", border_style="blue"))
    
    # Track command
    _track_command('export', {'output': output, 'days': days, 'repo': repo})
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            # Initialize exporter
            task = progress.add_task("Initializing exporter...", total=None)
            exporter = AnalyticsExporter(output_dir=output)
            
            # Run analysis first to ensure data is fresh
            progress.update(task, description="Analyzing repository...")
            try:
                analyzer = GitAnalyzer(repo)
                from .database import Database
                db = Database()
                
                # Get and save commits
                commits = analyzer.get_commit_history(days=days)
                if commits:
                    db.save_commit_batch(commits)
                
                # Get and save hotspots
                hotspots = analyzer.get_hotspot_files(days=days, limit=10)
                if hotspots:
                    hotspot_data = [
                        {
                            'file': file_path,
                            'changes': change_count,
                            'insertions': 0,
                            'deletions': 0,
                            'risk_level': 'critical' if change_count > 15 else 'high' if change_count > 10 else 'medium',
                            'unique_authors': 0,
                            'authors': []
                        }
                        for file_path, change_count, _ in hotspots
                    ]
                    db.save_hotspot_batch(hotspot_data, days_analyzed=days)
                
                # Calculate and save productivity score
                productivity = analyzer.generate_productivity_score(days=days)
                db.save_productivity_score({**productivity, 'days_analyzed': days})
            
            except Exception as e:
                console.print(f"[yellow]Warning: Could not analyze repository: {e}[/yellow]")
            
            # Export all analytics
            progress.update(task, description="Exporting productivity summary...")
            exporter.export_productivity_summary_json(days=7)
            
            progress.update(task, description="Exporting file hotspots...")
            exporter.export_file_hotspots_json(days=days)
            
            progress.update(task, description="Exporting commit analytics...")
            exporter.export_commit_analytics_json(days=365)
            
            progress.update(task, description="Exporting command usage...")
            exporter.export_command_usage_json(limit=10)
            
            progress.update(task, description="Exporting insights...")
            exporter.export_insights_json(days=days)
        
        # Display success
        console.print(f"\n[green]✓[/green] Analytics exported successfully!")
        console.print(f"[bold]Output directory:[/bold] {exporter.output_dir}")
        console.print("\n[bold cyan]Files created:[/bold cyan]")
        
        files = [
            'productivity-summary.json',
            'file-hotspots.json',
            'commit-analytics.json',
            'command-usage.json',
            'insights.json'
        ]
        
        for file in files:
            file_path = exporter.output_dir / file
            if file_path.exists():
                size = file_path.stat().st_size
                console.print(f"  • {file} ([dim]{size:,} bytes[/dim])")
        
        console.print(f"\n[dim]💡 Frontend can now load data from /devflow-data/*.json[/dim]")
    
    except Exception as e:
        console.print(f"\n[red]Error:[/red] {str(e)}")
        import traceback
        traceback.print_exc()


def _track_command(command_name, args):
    """Track command execution in history"""
    if not HISTORY_FILE.exists():
        return
    
    try:
        with open(HISTORY_FILE, 'r') as f:
            history_data = json.load(f)
        
        history_data['commands'].append({
            'command': command_name,
            'args': args,
            'timestamp': datetime.now().isoformat()
        })
        
        with open(HISTORY_FILE, 'w') as f:
            json.dump(history_data, f, indent=2)
    except Exception:
        pass


@cli.command()
@click.option('--refresh', is_flag=True, help='Force refresh demo repository')
@click.option('--cleanup', is_flag=True, help='Remove demo repository and start fresh')
def demo(refresh, cleanup):
    """Setup and run DevFlow demo with sample repository"""
    console.print(Panel.fit("🎯 [bold magenta]DevFlow Demo System[/bold magenta]", border_style="magenta"))
    
    # Track command
    _track_command('demo', {'refresh': refresh, 'cleanup': cleanup})
    
    try:
        demo_mgr = DemoManager()
        
        # Handle cleanup if requested
        if cleanup:
            console.print("\n[yellow]🗑️  Cleaning up demo...[/yellow]")
            if demo_mgr.cleanup_demo():
                console.print("[green]✓[/green] Demo repository removed")
            
            # Also remove demo database
            from pathlib import Path
            demo_db = Path('demo_devflow.db')
            if demo_db.exists():
                demo_db.unlink()
                console.print("[green]✓[/green] Demo database removed")
            
            console.print("\n[dim]Run 'python run.py demo' again to setup fresh demo[/dim]")
            return
        
        # Setup demo repository
        console.print("\n[bold cyan]📦 Step 1: Demo Repository Setup[/bold cyan]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Setting up demo repository...", total=None)
            
            if not demo_mgr.setup_demo_repo(force_refresh=refresh):
                console.print("[red]✗[/red] Failed to setup demo repository")
                return
            
            progress.update(task, description="✓ Demo repository ready")
        
        # Show repo info
        repo_info = demo_mgr.get_repo_info()
        if repo_info.get('initialized'):
            info_text = f"[bold]Path:[/bold] {repo_info['path']}\n"
            if 'commit_count' in repo_info:
                info_text += f"[bold]Commits:[/bold] {repo_info['commit_count']:,}\n"
                info_text += f"[bold]Branch:[/bold] {repo_info['branch']}\n"
            
            console.print(Panel(
                info_text,
                title="📊 Repository Info",
                border_style="cyan",
                padding=(0, 2)
            ))
        
        # Initialize database
        console.print("\n[bold cyan]💾 Step 2: Database Initialization[/bold cyan]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Initializing database...", total=None)
            
            if not demo_mgr.ensure_database():
                console.print("[red]✗[/red] Failed to initialize database")
                return
            
            progress.update(task, description="✓ Database ready")
        
        console.print("[green]✓[/green] Database initialized")
        
        # Ensure frontend directory exists
        console.print("\n[bold cyan]📂 Step 3: Frontend Directory Setup[/bold cyan]")
        
        if not demo_mgr.ensure_frontend_dir():
            console.print("[red]✗[/red] Failed to create frontend directory")
            return
        
        console.print(f"[green]✓[/green] Frontend directory: {demo_mgr.get_frontend_path()}")
        
        # Run analysis
        console.print("\n[bold cyan]📊 Step 4: Analyze Demo Repository[/bold cyan]")
        
        days = demo_mgr.config.get('analyze_days', 30)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Analyzing last {days} days...", total=None)
            
            try:
                analyzer = GitAnalyzer(str(demo_mgr.repo_path))
                from .database import Database
                db = Database()
                
                # Get and save commits
                commits = analyzer.get_commit_history(days=days)
                if commits:
                    db.save_commit_batch(commits)
                    console.print(f"[green]✓[/green] Saved {len(commits)} commits")
                
                # Get and save hotspots
                hotspots = analyzer.get_hotspot_files(days=days, limit=20)
                if hotspots:
                    hotspot_data = [
                        {
                            'file': file_path,
                            'changes': change_count,
                            'insertions': 0,
                            'deletions': 0,
                            'risk_level': 'critical' if change_count > 15 else 'high' if change_count > 10 else 'medium',
                            'unique_authors': 0,
                            'authors': []
                        }
                        for file_path, change_count, _ in hotspots
                    ]
                    db.save_hotspot_batch(hotspot_data, days_analyzed=days)
                    console.print(f"[green]✓[/green] Identified {len(hotspots)} hotspot files")
                
                # Calculate and save productivity score
                productivity = analyzer.generate_productivity_score(days=days)
                db.save_productivity_score({**productivity, 'days_analyzed': days})
                console.print(f"[green]✓[/green] Productivity score: {productivity['score']:.1f}/100")
            
            except Exception as e:
                console.print(f"[yellow]Warning: Analysis error: {e}[/yellow]")
        
        # Export analytics
        console.print("\n[bold cyan]📤 Step 5: Export Analytics to JSON[/bold cyan]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Exporting analytics...", total=None)
            
            try:
                exporter = AnalyticsExporter(output_dir=str(demo_mgr.get_frontend_path()))
                
                progress.update(task, description="Exporting productivity summary...")
                exporter.export_productivity_summary_json(days=7)
                
                progress.update(task, description="Exporting file hotspots...")
                exporter.export_file_hotspots_json(days=days)
                
                progress.update(task, description="Exporting commit analytics...")
                exporter.export_commit_analytics_json(days=365)
                
                progress.update(task, description="Exporting command usage...")
                exporter.export_command_usage_json(limit=10)
                
                progress.update(task, description="Exporting insights...")
                exporter.export_insights_json(days=days)
                
                console.print("[green]✓[/green] All analytics exported")
            
            except Exception as e:
                console.print(f"[red]✗[/red] Export failed: {e}")
                import traceback
                traceback.print_exc()
                return
        
        # Display success summary
        console.print("\n" + "="*60)
        console.print(Panel.fit(
            "[bold green]✅ Demo Ready![/bold green]\n\n"
            f"[cyan]📊 Analytics Period:[/cyan] Last {days} days\n"
            f"[cyan]💾 Data Location:[/cyan] {demo_mgr.get_frontend_path()}\n"
            f"[cyan]📦 Demo Repository:[/cyan] {demo_mgr.repo_path}\n\n"
            "[yellow]Next Steps:[/yellow]\n"
            "  1. Start frontend: [bold]cd frontend && npm run dev[/bold]\n"
            "  2. Open browser: [bold]http://localhost:5173[/bold]\n"
            "  3. View insights in the Intelligence section\n\n"
            "[dim]To refresh demo data: python run.py demo --refresh[/dim]\n"
            "[dim]To start fresh: python run.py demo --cleanup[/dim]",
            title="🎯 DevFlow Demo System",
            border_style="green",
            padding=(1, 2)
        ))
        console.print("="*60 + "\n")
        
    except FileNotFoundError as e:
        console.print(f"\n[red]Error:[/red] {str(e)}")
        console.print("[dim]Make sure config/demo_config.json exists[/dim]")
    except Exception as e:
        console.print(f"\n[red]Error:[/red] {str(e)}")
        import traceback
        traceback.print_exc()


def _track_command(command_name, args):
    """Track command execution in history"""
    if not HISTORY_FILE.exists():
        return
    
    try:
        with open(HISTORY_FILE, 'r') as f:
            history_data = json.load(f)
        
        history_data['commands'].append({
            'command': command_name,
            'args': args,
            'timestamp': datetime.now().isoformat()
        })
        
        with open(HISTORY_FILE, 'w') as f:
            json.dump(history_data, f, indent=2)
    except Exception:
        pass


if __name__ == '__main__':
    cli()
