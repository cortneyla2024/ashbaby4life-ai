# =============================================================================
# CareConnect v5.0 - AI Self-Update System
# =============================================================================

import os
import sys
import json
import logging
import hashlib
import requests
import subprocess
import shutil
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import yaml
import zipfile
import tempfile
from pathlib import Path

# =============================================================================
# Configuration
# =============================================================================

class UpdateConfig:
    """Configuration for the self-update system."""
    
    def __init__(self, config_path: str = "config.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file."""
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        else:
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration."""
        return {
            'update': {
                'enabled': True,
                'auto_update': False,
                'check_interval_hours': 24,
                'backup_before_update': True,
                'rollback_on_failure': True,
                'update_sources': [
                    {
                        'name': 'local',
                        'type': 'local',
                        'path': './updates'
                    }
                ],
                'version_control': {
                    'enabled': True,
                    'git_repository': None,
                    'branch': 'main'
                }
            }
        }
    
    def get_update_config(self) -> Dict[str, Any]:
        """Get update configuration."""
        return self.config.get('update', {})

# =============================================================================
# Version Management
# =============================================================================

class VersionManager:
    """Manage version information and comparison."""
    
    def __init__(self, version_file: str = "version.json"):
        self.version_file = version_file
        self.current_version = self._load_current_version()
    
    def _load_current_version(self) -> Dict[str, Any]:
        """Load current version information."""
        if os.path.exists(self.version_file):
            with open(self.version_file, 'r') as f:
                return json.load(f)
        else:
            return self._create_default_version()
    
    def _create_default_version(self) -> Dict[str, Any]:
        """Create default version information."""
        version_info = {
            'version': '1.0.0',
            'build_number': 1,
            'build_date': datetime.now().isoformat(),
            'commit_hash': 'unknown',
            'branch': 'main',
            'components': {
                'model': '1.0.0',
                'training': '1.0.0',
                'evaluation': '1.0.0',
                'prediction': '1.0.0',
                'preprocessing': '1.0.0'
            }
        }
        self._save_version(version_info)
        return version_info
    
    def _save_version(self, version_info: Dict[str, Any]):
        """Save version information to file."""
        with open(self.version_file, 'w') as f:
            json.dump(version_info, f, indent=2)
    
    def get_current_version(self) -> str:
        """Get current version string."""
        return self.current_version['version']
    
    def get_build_number(self) -> int:
        """Get current build number."""
        return self.current_version['build_number']
    
    def compare_versions(self, version1: str, version2: str) -> int:
        """Compare two version strings. Returns -1, 0, or 1."""
        v1_parts = [int(x) for x in version1.split('.')]
        v2_parts = [int(x) for x in version2.split('.')]
        
        for i in range(max(len(v1_parts), len(v2_parts))):
            v1_part = v1_parts[i] if i < len(v1_parts) else 0
            v2_part = v2_parts[i] if i < len(v2_parts) else 0
            
            if v1_part < v2_part:
                return -1
            elif v1_part > v2_part:
                return 1
        
        return 0
    
    def is_newer_version(self, new_version: str) -> bool:
        """Check if new version is newer than current."""
        return self.compare_versions(new_version, self.get_current_version()) > 0
    
    def update_version(self, new_version_info: Dict[str, Any]):
        """Update to new version."""
        self.current_version = new_version_info
        self._save_version(new_version_info)

# =============================================================================
# Update Sources
# =============================================================================

class UpdateSource:
    """Base class for update sources."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.name = config.get('name', 'unknown')
    
    def check_for_updates(self) -> List[Dict[str, Any]]:
        """Check for available updates."""
        raise NotImplementedError
    
    def download_update(self, update_info: Dict[str, Any]) -> str:
        """Download an update."""
        raise NotImplementedError
    
    def validate_update(self, update_path: str, expected_hash: str) -> bool:
        """Validate downloaded update."""
        if not os.path.exists(update_path):
            return False
        
        with open(update_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        
        return file_hash == expected_hash

class LocalUpdateSource(UpdateSource):
    """Local file system update source."""
    
    def check_for_updates(self) -> List[Dict[str, Any]]:
        """Check for updates in local directory."""
        updates = []
        update_path = self.config.get('path', './updates')
        
        if not os.path.exists(update_path):
            return updates
        
        for item in os.listdir(update_path):
            item_path = os.path.join(update_path, item)
            if os.path.isdir(item_path):
                version_file = os.path.join(item_path, 'version.json')
                if os.path.exists(version_file):
                    try:
                        with open(version_file, 'r') as f:
                            version_info = json.load(f)
                        updates.append({
                            'version': version_info['version'],
                            'path': item_path,
                            'version_info': version_info,
                            'source': self.name
                        })
                    except Exception as e:
                        logging.warning(f"Failed to read version info from {version_file}: {e}")
        
        return updates
    
    def download_update(self, update_info: Dict[str, Any]) -> str:
        """Copy update from local directory."""
        source_path = update_info['path']
        temp_dir = tempfile.mkdtemp()
        dest_path = os.path.join(temp_dir, 'update')
        
        shutil.copytree(source_path, dest_path)
        return dest_path

class GitUpdateSource(UpdateSource):
    """Git repository update source."""
    
    def check_for_updates(self) -> List[Dict[str, Any]]:
        """Check for updates in git repository."""
        updates = []
        repo_url = self.config.get('git_repository')
        branch = self.config.get('branch', 'main')
        
        if not repo_url:
            return updates
        
        try:
            # Clone or fetch latest changes
            temp_dir = tempfile.mkdtemp()
            repo_path = os.path.join(temp_dir, 'repo')
            
            if os.path.exists(repo_path):
                # Fetch latest changes
                subprocess.run(['git', 'fetch'], cwd=repo_path, check=True)
            else:
                # Clone repository
                subprocess.run(['git', 'clone', repo_url, repo_path], check=True)
            
            # Check for new commits
            subprocess.run(['git', 'checkout', branch], cwd=repo_path, check=True)
            subprocess.run(['git', 'pull'], cwd=repo_path, check=True)
            
            # Get latest commit info
            result = subprocess.run(['git', 'log', '-1', '--format=%H|%s|%ci'], 
                                  cwd=repo_path, capture_output=True, text=True, check=True)
            commit_info = result.stdout.strip().split('|')
            
            if len(commit_info) >= 3:
                commit_hash, commit_message, commit_date = commit_info
                
                # Check version file
                version_file = os.path.join(repo_path, 'version.json')
                if os.path.exists(version_file):
                    with open(version_file, 'r') as f:
                        version_info = json.load(f)
                    
                    updates.append({
                        'version': version_info['version'],
                        'path': repo_path,
                        'version_info': version_info,
                        'commit_hash': commit_hash,
                        'commit_message': commit_message,
                        'commit_date': commit_date,
                        'source': self.name
                    })
        
        except Exception as e:
            logging.error(f"Failed to check git repository for updates: {e}")
        
        return updates
    
    def download_update(self, update_info: Dict[str, Any]) -> str:
        """Download update from git repository."""
        # For git, we already have the files in the repository path
        return update_info['path']

# =============================================================================
# Update Manager
# =============================================================================

class UpdateManager:
    """Main update manager for the AI engine."""
    
    def __init__(self, config_path: str = "config.yaml"):
        self.config = UpdateConfig(config_path)
        self.version_manager = VersionManager()
        self.update_sources = self._initialize_update_sources()
        self.backup_manager = BackupManager()
        
    def _initialize_update_sources(self) -> List[UpdateSource]:
        """Initialize update sources from configuration."""
        sources = []
        update_config = self.config.get_update_config()
        
        for source_config in update_config.get('update_sources', []):
            source_type = source_config.get('type', 'local')
            
            if source_type == 'local':
                sources.append(LocalUpdateSource(source_config))
            elif source_type == 'git':
                sources.append(GitUpdateSource(source_config))
            else:
                logging.warning(f"Unknown update source type: {source_type}")
        
        return sources
    
    def check_for_updates(self) -> List[Dict[str, Any]]:
        """Check all sources for available updates."""
        all_updates = []
        
        for source in self.update_sources:
            try:
                updates = source.check_for_updates()
                all_updates.extend(updates)
            except Exception as e:
                logging.error(f"Failed to check source {source.name}: {e}")
        
        # Filter for newer versions
        current_version = self.version_manager.get_current_version()
        newer_updates = [
            update for update in all_updates
            if self.version_manager.is_newer_version(update['version'])
        ]
        
        return newer_updates
    
    def install_update(self, update_info: Dict[str, Any]) -> bool:
        """Install an update."""
        update_config = self.config.get_update_config()
        
        try:
            # Create backup if enabled
            if update_config.get('backup_before_update', True):
                backup_path = self.backup_manager.create_backup()
                logging.info(f"Created backup at: {backup_path}")
            
            # Download update
            source = self._find_source(update_info['source'])
            if not source:
                logging.error(f"Update source not found: {update_info['source']}")
                return False
            
            update_path = source.download_update(update_info)
            
            # Install update
            success = self._install_update_files(update_path, update_info)
            
            if success:
                # Update version information
                self.version_manager.update_version(update_info['version_info'])
                logging.info(f"Successfully updated to version {update_info['version']}")
                return True
            else:
                # Rollback if enabled
                if update_config.get('rollback_on_failure', True):
                    self.backup_manager.rollback_backup()
                    logging.info("Update failed, rolled back to previous version")
                return False
        
        except Exception as e:
            logging.error(f"Update installation failed: {e}")
            return False
    
    def _find_source(self, source_name: str) -> Optional[UpdateSource]:
        """Find update source by name."""
        for source in self.update_sources:
            if source.name == source_name:
                return source
        return None
    
    def _install_update_files(self, update_path: str, update_info: Dict[str, Any]) -> bool:
        """Install update files."""
        try:
            # Read update manifest
            manifest_path = os.path.join(update_path, 'update_manifest.json')
            if not os.path.exists(manifest_path):
                logging.error("Update manifest not found")
                return False
            
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            # Install files
            for file_info in manifest.get('files', []):
                source_path = os.path.join(update_path, file_info['path'])
                dest_path = file_info['path']
                
                if os.path.exists(source_path):
                    # Create destination directory if needed
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    
                    # Copy file
                    shutil.copy2(source_path, dest_path)
                    logging.info(f"Updated file: {dest_path}")
            
            # Run post-update scripts if any
            post_update_script = os.path.join(update_path, 'post_update.py')
            if os.path.exists(post_update_script):
                subprocess.run([sys.executable, post_update_script], check=True)
                logging.info("Executed post-update script")
            
            return True
        
        except Exception as e:
            logging.error(f"Failed to install update files: {e}")
            return False
    
    def auto_update(self) -> bool:
        """Perform automatic update if enabled."""
        update_config = self.config.get_update_config()
        
        if not update_config.get('auto_update', False):
            return False
        
        # Check if it's time to update
        last_check_file = 'last_update_check.json'
        if os.path.exists(last_check_file):
            with open(last_check_file, 'r') as f:
                last_check = json.load(f)
            
            last_check_time = datetime.fromisoformat(last_check['timestamp'])
            check_interval = timedelta(hours=update_config.get('check_interval_hours', 24))
            
            if datetime.now() - last_check_time < check_interval:
                return False
        
        # Check for updates
        updates = self.check_for_updates()
        if not updates:
            # Update last check time
            with open(last_check_file, 'w') as f:
                json.dump({'timestamp': datetime.now().isoformat()}, f)
            return False
        
        # Install latest update
        latest_update = max(updates, key=lambda x: x['version'])
        success = self.install_update(latest_update)
        
        # Update last check time
        with open(last_check_file, 'w') as f:
            json.dump({'timestamp': datetime.now().isoformat()}, f)
        
        return success

# =============================================================================
# Backup Management
# =============================================================================

class BackupManager:
    """Manage backups for rollback functionality."""
    
    def __init__(self, backup_dir: str = "./backups"):
        self.backup_dir = backup_dir
        os.makedirs(backup_dir, exist_ok=True)
    
    def create_backup(self) -> str:
        """Create a backup of the current system."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"backup_{timestamp}"
        backup_path = os.path.join(self.backup_dir, backup_name)
        
        try:
            # Create backup directory
            os.makedirs(backup_path, exist_ok=True)
            
            # Files to backup
            files_to_backup = [
                'model.py',
                'train.py',
                'evaluate.py',
                'predict.py',
                'preprocess.py',
                'config.yaml',
                'version.json'
            ]
            
            # Copy files
            for file_name in files_to_backup:
                if os.path.exists(file_name):
                    shutil.copy2(file_name, os.path.join(backup_path, file_name))
            
            # Backup checkpoints if they exist
            if os.path.exists('./checkpoints'):
                shutil.copytree('./checkpoints', os.path.join(backup_path, 'checkpoints'))
            
            # Create backup manifest
            manifest = {
                'timestamp': datetime.now().isoformat(),
                'files': files_to_backup,
                'version': self._get_current_version()
            }
            
            with open(os.path.join(backup_path, 'backup_manifest.json'), 'w') as f:
                json.dump(manifest, f, indent=2)
            
            logging.info(f"Backup created: {backup_path}")
            return backup_path
        
        except Exception as e:
            logging.error(f"Failed to create backup: {e}")
            return ""
    
    def rollback_backup(self, backup_path: str = None) -> bool:
        """Rollback to a previous backup."""
        try:
            if backup_path is None:
                # Find latest backup
                backups = [d for d in os.listdir(self.backup_dir) if d.startswith('backup_')]
                if not backups:
                    logging.error("No backups found")
                    return False
                
                latest_backup = max(backups)
                backup_path = os.path.join(self.backup_dir, latest_backup)
            
            if not os.path.exists(backup_path):
                logging.error(f"Backup not found: {backup_path}")
                return False
            
            # Read backup manifest
            manifest_path = os.path.join(backup_path, 'backup_manifest.json')
            if os.path.exists(manifest_path):
                with open(manifest_path, 'r') as f:
                    manifest = json.load(f)
                
                # Restore files
                for file_name in manifest.get('files', []):
                    source_path = os.path.join(backup_path, file_name)
                    if os.path.exists(source_path):
                        shutil.copy2(source_path, file_name)
                        logging.info(f"Restored file: {file_name}")
                
                # Restore checkpoints
                source_checkpoints = os.path.join(backup_path, 'checkpoints')
                if os.path.exists(source_checkpoints):
                    if os.path.exists('./checkpoints'):
                        shutil.rmtree('./checkpoints')
                    shutil.copytree(source_checkpoints, './checkpoints')
                    logging.info("Restored checkpoints")
            
            logging.info(f"Rollback completed from: {backup_path}")
            return True
        
        except Exception as e:
            logging.error(f"Rollback failed: {e}")
            return False
    
    def _get_current_version(self) -> str:
        """Get current version."""
        try:
            if os.path.exists('version.json'):
                with open('version.json', 'r') as f:
                    version_info = json.load(f)
                return version_info.get('version', 'unknown')
        except:
            pass
        return 'unknown'
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """List available backups."""
        backups = []
        
        for backup_name in os.listdir(self.backup_dir):
            if backup_name.startswith('backup_'):
                backup_path = os.path.join(self.backup_dir, backup_name)
                manifest_path = os.path.join(backup_path, 'backup_manifest.json')
                
                backup_info = {
                    'name': backup_name,
                    'path': backup_path,
                    'timestamp': None,
                    'version': None
                }
                
                if os.path.exists(manifest_path):
                    try:
                        with open(manifest_path, 'r') as f:
                            manifest = json.load(f)
                        backup_info['timestamp'] = manifest.get('timestamp')
                        backup_info['version'] = manifest.get('version')
                    except:
                        pass
                
                backups.append(backup_info)
        
        return sorted(backups, key=lambda x: x['timestamp'] or '', reverse=True)

# =============================================================================
# Main Functions
# =============================================================================

def main():
    """Main update execution."""
    
    import argparse
    
    parser = argparse.ArgumentParser(description='CareConnect v5.0 AI Self-Update')
    parser.add_argument('--check', action='store_true', help='Check for updates')
    parser.add_argument('--install', type=str, help='Install specific version')
    parser.add_argument('--auto', action='store_true', help='Perform automatic update')
    parser.add_argument('--list-backups', action='store_true', help='List available backups')
    parser.add_argument('--rollback', type=str, help='Rollback to specific backup')
    parser.add_argument('--config', type=str, default='config.yaml', help='Configuration file')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/update.log'),
            logging.StreamHandler()
        ]
    )
    
    # Create update manager
    update_manager = UpdateManager(args.config)
    
    try:
        if args.check:
            # Check for updates
            updates = update_manager.check_for_updates()
            if updates:
                print(f"Found {len(updates)} available updates:")
                for update in updates:
                    print(f"  - Version {update['version']} from {update['source']}")
            else:
                print("No updates available")
        
        elif args.install:
            # Install specific version
            updates = update_manager.check_for_updates()
            target_update = None
            
            for update in updates:
                if update['version'] == args.install:
                    target_update = update
                    break
            
            if target_update:
                success = update_manager.install_update(target_update)
                if success:
                    print(f"Successfully installed version {args.install}")
                else:
                    print(f"Failed to install version {args.install}")
            else:
                print(f"Version {args.install} not found in available updates")
        
        elif args.auto:
            # Automatic update
            success = update_manager.auto_update()
            if success:
                print("Automatic update completed successfully")
            else:
                print("No automatic update performed")
        
        elif args.list_backups:
            # List backups
            backups = update_manager.backup_manager.list_backups()
            if backups:
                print("Available backups:")
                for backup in backups:
                    print(f"  - {backup['name']} (Version: {backup['version']}, Time: {backup['timestamp']})")
            else:
                print("No backups available")
        
        elif args.rollback:
            # Rollback to backup
            success = update_manager.backup_manager.rollback_backup(args.rollback)
            if success:
                print(f"Successfully rolled back to backup: {args.rollback}")
            else:
                print(f"Failed to rollback to backup: {args.rollback}")
        
        else:
            # Default: check for updates
            updates = update_manager.check_for_updates()
            if updates:
                print(f"Found {len(updates)} available updates:")
                for update in updates:
                    print(f"  - Version {update['version']} from {update['source']}")
                print("\nUse --install <version> to install an update")
            else:
                print("No updates available")
    
    except Exception as e:
        logging.error(f"Update operation failed: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
