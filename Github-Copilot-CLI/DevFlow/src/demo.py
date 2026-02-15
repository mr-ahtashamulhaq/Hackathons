"""
Demo System for DevFlow
Handles automatic setup and demo repository management
"""

import json
import os
import subprocess
from pathlib import Path
from typing import Dict, Any
import shutil


class DemoManager:
    """Manages demo repository setup and analytics generation"""
    
    def __init__(self, config_path: str = None):
        """Initialize demo manager with configuration"""
        if config_path is None:
            config_path = Path(__file__).parent.parent / 'config' / 'demo_config.json'
        
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self.repo_path = Path(self.config['demo_repo_path'])
        self.project_root = Path(__file__).parent.parent
    
    def _load_config(self) -> Dict[str, Any]:
        """Load demo configuration from JSON"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Demo config not found: {self.config_path}")
        
        with open(self.config_path, 'r') as f:
            return json.load(f)
    
    def is_demo_initialized(self) -> bool:
        """Check if demo repository already exists"""
        return self.repo_path.exists() and (self.repo_path / '.git').exists()
    
    def clone_demo_repo(self) -> bool:
        """Clone the demo repository"""
        try:
            # Create parent directory if needed
            self.repo_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Build clone command
            cmd = ['git', 'clone']
            
            # Add shallow clone options if configured
            if self.config.get('shallow_clone', False):
                depth = self.config.get('depth', 100)
                cmd.extend(['--depth', str(depth)])
            
            # Add branch if specified
            if 'branch' in self.config and self.config['branch']:
                cmd.extend(['--branch', self.config['branch']])
            
            # Add URL and destination
            cmd.extend([self.config['repo_url'], str(self.repo_path)])
            
            # Execute clone
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            return True
        
        except subprocess.CalledProcessError as e:
            print(f"Git clone failed: {e.stderr}")
            return False
        except Exception as e:
            print(f"Error cloning repository: {e}")
            return False
    
    def update_demo_repo(self) -> bool:
        """Pull latest changes in demo repository"""
        try:
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'pull'],
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            print(f"Git pull failed: {e.stderr}")
            return False
        except Exception as e:
            print(f"Error updating repository: {e}")
            return False
    
    def setup_demo_repo(self, force_refresh: bool = False) -> bool:
        """Setup demo repository (clone or update)"""
        # If demo repo path is current directory, skip clone
        if str(self.repo_path) == "." or self.repo_path.resolve() == Path.cwd():
            print("Using current directory as demo repository")
            return True
        
        if self.is_demo_initialized():
            if force_refresh:
                print("Demo repository exists. Updating...")
                return self.update_demo_repo()
            else:
                print("Demo repository already initialized.")
                return True
        else:
            print("Cloning demo repository...")
            return self.clone_demo_repo()
    
    def cleanup_demo(self) -> bool:
        """Remove demo repository and data"""
        try:
            if self.repo_path.exists():
                shutil.rmtree(self.repo_path)
            return True
        except Exception as e:
            print(f"Error cleaning up demo: {e}")
            return False
    
    def get_repo_info(self) -> Dict[str, Any]:
        """Get information about the demo repository"""
        if not self.is_demo_initialized():
            return {
                'initialized': False,
                'path': str(self.repo_path)
            }
        
        try:
            # Get commit count
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'rev-list', '--count', 'HEAD'],
                capture_output=True,
                text=True,
                check=True
            )
            commit_count = int(result.stdout.strip())
            
            # Get branch name
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'rev-parse', '--abbrev-ref', 'HEAD'],
                capture_output=True,
                text=True,
                check=True
            )
            branch = result.stdout.strip()
            
            # Get remote URL
            result = subprocess.run(
                ['git', '-C', str(self.repo_path), 'config', '--get', 'remote.origin.url'],
                capture_output=True,
                text=True,
                check=True
            )
            remote_url = result.stdout.strip()
            
            return {
                'initialized': True,
                'path': str(self.repo_path),
                'commit_count': commit_count,
                'branch': branch,
                'remote_url': remote_url
            }
        
        except Exception as e:
            return {
                'initialized': True,
                'path': str(self.repo_path),
                'error': str(e)
            }
    
    def ensure_database(self) -> bool:
        """Ensure database is initialized"""
        try:
            from .database import Database
            db = Database()
            # Database auto-initializes on instantiation
            return True
        except Exception as e:
            print(f"Error initializing database: {e}")
            return False
    
    def get_frontend_path(self) -> Path:
        """Get path to frontend public data directory"""
        return self.project_root / 'frontend' / 'public' / 'devflow-data'
    
    def ensure_frontend_dir(self) -> bool:
        """Ensure frontend data directory exists"""
        try:
            frontend_path = self.get_frontend_path()
            frontend_path.mkdir(parents=True, exist_ok=True)
            return True
        except Exception as e:
            print(f"Error creating frontend directory: {e}")
            return False
