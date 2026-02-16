# DevFlow - Developer Productivity CLI

A powerful command-line tool for analyzing git repositories, tracking development workflows, and optimizing developer productivity.
[![Live Demo](https://img.shields.io/badge/Live-Demo-black?style=for-the-badge)](https://github-copilot-hackathon.vercel.app)

## 🚀 Features

- **Git Analytics** - Deep dive into commit history, patterns, and code changes
- **Commit Quality Scoring** - Automated assessment of commit message quality
- **Hotspot Detection** - Identify frequently changed files that need attention
- **Productivity Metrics** - Track and visualize developer productivity
- **Command History Analysis** - Analyze shell history and suggest aliases
- **Beautiful Terminal UI** - Rich tables, panels, and colored output

## 📦 Installation

### Prerequisites
- Python 3.8+
- Git installed and accessible in PATH

### Install Dependencies

```bash
# Install required packages
pip install -r requirements.txt

# Or install in development mode
pip install -e .
```

## 🎯 Quick Start

```bash
# Initialize DevFlow
python run.py init

# Analyze git repository (last 30 days)
python run.py analyze

# Analyze with filters
python run.py analyze --days 60 --author "John"

# View command history analysis
python run.py history

# Get alias suggestions
python run.py history --suggest-aliases

# Show dashboard (WIP)
python run.py dashboard
```

## 📊 Commands

### `analyze` - Git Repository Analysis

Comprehensive analysis of your git repository including:
- Commit statistics and trends
- Top contributors
- File hotspots (most changed files)
- Commit quality scoring
- Productivity score with insights

```bash
python run.py analyze [OPTIONS]

Options:
  --repo PATH       Path to git repository (default: current directory)
  --author TEXT     Filter commits by author
  --days INTEGER    Number of days to analyze (default: 30)
  --limit INTEGER   Max commits to process (default: 100)
```

**Example Output:**
```
📊 Git Commit Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Commit Summary
┌──────────────────────┬──────────┐
│ Total Commits        │      42  │
│ Files Changed        │     156  │
│ Lines Added          │  +2,340  │
│ Lines Deleted        │  -1,120  │
└──────────────────────┴──────────┘

📊 Productivity Score: 85/100 (Grade: A)
```

### `history` - Command History Analysis

Analyzes your shell history (PowerShell/Bash) to:
- Find most used commands
- Detect command sequences
- Suggest time-saving aliases

```bash
python run.py history [OPTIONS]

Options:
  --limit INTEGER         Number of commands to show (default: 10)
  --suggest-aliases      Show only alias suggestions
  --clear                Clear DevFlow command history
```

### `init` - Initialize DevFlow

Sets up DevFlow configuration and creates necessary directories.

```bash
python run.py init [OPTIONS]

Options:
  --path PATH    Repository path (default: current directory)
  --force        Force reinitialization
```

### `dashboard` - Terminal Dashboard

Live dashboard with development metrics (Work in Progress).

```bash
python run.py dashboard [OPTIONS]

Options:
  --refresh INTEGER    Refresh interval in seconds (default: 5)
  --mode TEXT         Display mode: live or static (default: static)
```

## 🔧 Configuration

DevFlow stores configuration and data in:
- **Config Directory:** `~/.devflow/`
- **Database:** `~/.devflow/devflow.db`
- **Config File:** `~/.devflow/config.json`
- **History File:** `~/.devflow/history.json`

## 📚 Architecture

```
devflow/
├── src/
│   ├── cli.py           # Main CLI interface
│   ├── git_analyzer.py  # Git repository analysis
│   ├── database.py      # SQLite data persistence
│   ├── history.py       # Shell history analysis
│   └── file_tracker.py  # File change tracking
├── config/              # Configuration files
├── scripts/             # Utility scripts
├── tests/               # Test files
├── run.py              # Entry point
└── requirements.txt     # Dependencies
```

## 🧪 Testing

```bash
# Test git analyzer
python test_analyzer.py

# Test history analyzer
python test_history.py

# Test CLI commands
python test_history_cli.py

# Full integration test (Windows)
test_full.bat
```

## 📈 Productivity Score

The productivity score (0-100) combines three metrics:

1. **Commit Frequency (40 points)** - Consistency and volume
2. **Code Quality (30 points)** - Commit message quality
3. **Work Distribution (30 points)** - Healthy work-life balance

**Grades:**
- A+ (90-100): Excellent productivity
- A (80-89): Great productivity
- B (70-79): Good productivity
- C (60-69): Average productivity
- D (<60): Needs improvement

## 🎨 Rich Output

DevFlow uses the [Rich](https://rich.readthedocs.io/) library for beautiful terminal output:
- Colored tables and panels
- Progress bars for long operations
- Syntax highlighting
- Responsive layouts

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - See LICENSE file for details

## 🐛 Troubleshooting

### "Not a valid git repository"
Make sure you're running commands inside a git repository or provide a path with `--repo`.

### "No commits found"
- Check if the repository has commits in the specified time range
- Try increasing `--days` parameter
- Remove author filters if applied

### Empty shell history
- PowerShell: History might be disabled or in a non-standard location
- Bash: Check if `~/.bash_history` exists

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Made with ❤️ for developers by developers
# test update
