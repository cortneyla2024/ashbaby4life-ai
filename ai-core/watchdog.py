# =============================================================================
# CareConnect v5.0 - AI Engine Watchdog
# =============================================================================

import os
import sys
import time
import json
import logging
import psutil
import threading
import subprocess
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
import yaml
import signal
import queue
import socket
from pathlib import Path

# =============================================================================
# Configuration
# =============================================================================

class WatchdogConfig:
    """Configuration for the watchdog system."""
    
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
            'watchdog': {
                'enabled': True,
                'check_interval_seconds': 30,
                'max_restart_attempts': 3,
                'restart_cooldown_seconds': 60,
                'health_check_timeout': 10,
                'log_health_metrics': True,
                'alert_on_failure': True,
                'monitored_services': [
                    {
                        'name': 'ai_engine',
                        'type': 'process',
                        'command': ['python', 'predict.py'],
                        'port': 8001,
                        'health_endpoint': '/health',
                        'max_memory_mb': 2048,
                        'max_cpu_percent': 80
                    }
                ],
                'notifications': {
                    'email': {
                        'enabled': False,
                        'smtp_server': 'localhost',
                        'smtp_port': 587,
                        'username': '',
                        'password': '',
                        'recipients': []
                    },
                    'webhook': {
                        'enabled': False,
                        'url': '',
                        'headers': {}
                    }
                }
            }
        }
    
    def get_watchdog_config(self) -> Dict[str, Any]:
        """Get watchdog configuration."""
        return self.config.get('watchdog', {})

# =============================================================================
# Health Monitoring
# =============================================================================

class HealthMonitor:
    """Monitor health of system components."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.health_history = []
        self.max_history_size = 1000
    
    def check_system_health(self) -> Dict[str, Any]:
        """Check overall system health."""
        health_info = {
            'timestamp': datetime.now().isoformat(),
            'system': self._check_system_metrics(),
            'services': self._check_services_health(),
            'overall_status': 'healthy'
        }
        
        # Determine overall status
        if any(service['status'] == 'unhealthy' for service in health_info['services']):
            health_info['overall_status'] = 'unhealthy'
        elif any(service['status'] == 'warning' for service in health_info['services']):
            health_info['overall_status'] = 'warning'
        
        # Store in history
        self.health_history.append(health_info)
        if len(self.health_history) > self.max_history_size:
            self.health_history.pop(0)
        
        return health_info
    
    def _check_system_metrics(self) -> Dict[str, Any]:
        """Check system-level metrics."""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            
            # Disk usage
            disk = psutil.disk_usage('/')
            
            # Network I/O
            network = psutil.net_io_counters()
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_mb': memory.available / (1024 * 1024),
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / (1024 * 1024 * 1024),
                'network_bytes_sent': network.bytes_sent,
                'network_bytes_recv': network.bytes_recv,
                'load_average': self._get_load_average()
            }
        except Exception as e:
            logging.error(f"Failed to check system metrics: {e}")
            return {'error': str(e)}
    
    def _get_load_average(self) -> List[float]:
        """Get system load average."""
        try:
            if hasattr(psutil, 'getloadavg'):
                return list(psutil.getloadavg())
            else:
                # Windows fallback
                return [0.0, 0.0, 0.0]
        except:
            return [0.0, 0.0, 0.0]
    
    def _check_services_health(self) -> List[Dict[str, Any]]:
        """Check health of monitored services."""
        services = []
        monitored_services = self.config.get('monitored_services', [])
        
        for service_config in monitored_services:
            service_health = self._check_service_health(service_config)
            services.append(service_health)
        
        return services
    
    def _check_service_health(self, service_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check health of a specific service."""
        service_name = service_config.get('name', 'unknown')
        service_type = service_config.get('type', 'process')
        
        health_info = {
            'name': service_name,
            'type': service_type,
            'status': 'unknown',
            'last_check': datetime.now().isoformat(),
            'details': {}
        }
        
        try:
            if service_type == 'process':
                health_info.update(self._check_process_health(service_config))
            elif service_type == 'http':
                health_info.update(self._check_http_health(service_config))
            elif service_type == 'port':
                health_info.update(self._check_port_health(service_config))
            else:
                health_info['status'] = 'unknown'
                health_info['details']['error'] = f'Unknown service type: {service_type}'
        
        except Exception as e:
            health_info['status'] = 'error'
            health_info['details']['error'] = str(e)
        
        return health_info
    
    def _check_process_health(self, service_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check health of a process-based service."""
        command = service_config.get('command', [])
        max_memory_mb = service_config.get('max_memory_mb', 1024)
        max_cpu_percent = service_config.get('max_cpu_percent', 80)
        
        # Find process by command
        process = self._find_process_by_command(command)
        
        if not process:
            return {
                'status': 'unhealthy',
                'details': {
                    'error': 'Process not found',
                    'command': command
                }
            }
        
        # Check process metrics
        try:
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / (1024 * 1024)
            cpu_percent = process.cpu_percent()
            
            details = {
                'pid': process.pid,
                'memory_mb': memory_mb,
                'cpu_percent': cpu_percent,
                'status': process.status(),
                'create_time': datetime.fromtimestamp(process.create_time()).isoformat()
            }
            
            # Determine status
            if memory_mb > max_memory_mb or cpu_percent > max_cpu_percent:
                status = 'warning'
            elif process.status() == psutil.STATUS_RUNNING:
                status = 'healthy'
            else:
                status = 'unhealthy'
            
            return {
                'status': status,
                'details': details
            }
        
        except Exception as e:
            return {
                'status': 'error',
                'details': {
                    'error': str(e),
                    'pid': process.pid if process else None
                }
            }
    
    def _find_process_by_command(self, command: List[str]) -> Optional[psutil.Process]:
        """Find process by command line."""
        for proc in psutil.process_iter(['pid', 'cmdline']):
            try:
                cmdline = proc.info['cmdline']
                if cmdline and len(cmdline) >= len(command):
                    # Check if command matches
                    if all(cmdline[i] == command[i] for i in range(len(command))):
                        return proc
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return None
    
    def _check_http_health(self, service_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check health of an HTTP service."""
        import requests
        
        port = service_config.get('port', 8000)
        health_endpoint = service_config.get('health_endpoint', '/health')
        timeout = self.config.get('health_check_timeout', 10)
        
        url = f"http://localhost:{port}{health_endpoint}"
        
        try:
            response = requests.get(url, timeout=timeout)
            
            details = {
                'url': url,
                'status_code': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'content_length': len(response.content)
            }
            
            if response.status_code == 200:
                status = 'healthy'
            elif response.status_code < 500:
                status = 'warning'
            else:
                status = 'unhealthy'
            
            return {
                'status': status,
                'details': details
            }
        
        except Exception as e:
            return {
                'status': 'unhealthy',
                'details': {
                    'error': str(e),
                    'url': url
                }
            }
    
    def _check_port_health(self, service_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check health of a service by port."""
        port = service_config.get('port', 8000)
        
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            
            details = {
                'port': port,
                'connection_result': result
            }
            
            if result == 0:
                status = 'healthy'
            else:
                status = 'unhealthy'
            
            return {
                'status': status,
                'details': details
            }
        
        except Exception as e:
            return {
                'status': 'error',
                'details': {
                    'error': str(e),
                    'port': port
                }
            }
    
    def get_health_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get health history for the specified time period."""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        return [
            health for health in self.health_history
            if datetime.fromisoformat(health['timestamp']) > cutoff_time
        ]
    
    def get_health_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get health summary for the specified time period."""
        history = self.get_health_history(hours)
        
        if not history:
            return {'error': 'No health data available'}
        
        # Calculate statistics
        system_metrics = [h['system'] for h in history if 'system' in h]
        
        summary = {
            'period_hours': hours,
            'total_checks': len(history),
            'healthy_checks': sum(1 for h in history if h['overall_status'] == 'healthy'),
            'warning_checks': sum(1 for h in history if h['overall_status'] == 'warning'),
            'unhealthy_checks': sum(1 for h in history if h['overall_status'] == 'unhealthy'),
            'uptime_percentage': 0.0
        }
        
        if summary['total_checks'] > 0:
            summary['uptime_percentage'] = (summary['healthy_checks'] / summary['total_checks']) * 100
        
        # System metrics averages
        if system_metrics:
            summary['avg_cpu_percent'] = sum(m.get('cpu_percent', 0) for m in system_metrics) / len(system_metrics)
            summary['avg_memory_percent'] = sum(m.get('memory_percent', 0) for m in system_metrics) / len(system_metrics)
            summary['avg_disk_percent'] = sum(m.get('disk_percent', 0) for m in system_metrics) / len(system_metrics)
        
        return summary

# =============================================================================
# Service Management
# =============================================================================

class ServiceManager:
    """Manage service lifecycle and restart."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.restart_history = {}
        self.max_restart_attempts = config.get('max_restart_attempts', 3)
        self.restart_cooldown = config.get('restart_cooldown_seconds', 60)
    
    def restart_service(self, service_name: str, service_config: Dict[str, Any]) -> bool:
        """Restart a service."""
        current_time = datetime.now()
        
        # Check restart history
        if service_name in self.restart_history:
            last_restart, attempts = self.restart_history[service_name]
            
            # Check cooldown period
            if (current_time - last_restart).total_seconds() < self.restart_cooldown:
                logging.warning(f"Service {service_name} restart skipped due to cooldown")
                return False
            
            # Check max attempts
            if attempts >= self.max_restart_attempts:
                logging.error(f"Service {service_name} restart failed: max attempts reached")
                return False
            
            attempts += 1
        else:
            attempts = 1
        
        try:
            # Stop existing process
            self._stop_service(service_name, service_config)
            
            # Wait a moment
            time.sleep(2)
            
            # Start new process
            success = self._start_service(service_name, service_config)
            
            if success:
                self.restart_history[service_name] = (current_time, attempts)
                logging.info(f"Service {service_name} restarted successfully (attempt {attempts})")
                return True
            else:
                logging.error(f"Service {service_name} restart failed")
                return False
        
        except Exception as e:
            logging.error(f"Service {service_name} restart error: {e}")
            return False
    
    def _stop_service(self, service_name: str, service_config: Dict[str, Any]):
        """Stop a service."""
        service_type = service_config.get('type', 'process')
        
        if service_type == 'process':
            command = service_config.get('command', [])
            process = self._find_process_by_command(command)
            
            if process:
                try:
                    process.terminate()
                    process.wait(timeout=10)
                except psutil.TimeoutExpired:
                    process.kill()
                    process.wait()
                except psutil.NoSuchProcess:
                    pass
    
    def _start_service(self, service_name: str, service_config: Dict[str, Any]) -> bool:
        """Start a service."""
        service_type = service_config.get('type', 'process')
        
        if service_type == 'process':
            command = service_config.get('command', [])
            working_dir = service_config.get('working_dir', '.')
            
            try:
                subprocess.Popen(
                    command,
                    cwd=working_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    start_new_session=True
                )
                return True
            except Exception as e:
                logging.error(f"Failed to start service {service_name}: {e}")
                return False
        
        return False
    
    def _find_process_by_command(self, command: List[str]) -> Optional[psutil.Process]:
        """Find process by command line."""
        for proc in psutil.process_iter(['pid', 'cmdline']):
            try:
                cmdline = proc.info['cmdline']
                if cmdline and len(cmdline) >= len(command):
                    if all(cmdline[i] == command[i] for i in range(len(command))):
                        return proc
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return None

# =============================================================================
# Notifications
# =============================================================================

class NotificationManager:
    """Manage notifications and alerts."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.notification_config = config.get('notifications', {})
    
    def send_alert(self, message: str, level: str = 'warning', service_name: str = None):
        """Send an alert notification."""
        logging.info(f"Alert [{level}]: {message}")
        
        # Send email notification
        if self.notification_config.get('email', {}).get('enabled', False):
            self._send_email_alert(message, level, service_name)
        
        # Send webhook notification
        if self.notification_config.get('webhook', {}).get('enabled', False):
            self._send_webhook_alert(message, level, service_name)
    
    def _send_email_alert(self, message: str, level: str, service_name: str):
        """Send email alert."""
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            email_config = self.notification_config['email']
            
            msg = MIMEMultipart()
            msg['From'] = email_config['username']
            msg['To'] = ', '.join(email_config['recipients'])
            msg['Subject'] = f"CareConnect Watchdog Alert [{level.upper()}]"
            
            body = f"""
            CareConnect AI Engine Watchdog Alert
            
            Level: {level.upper()}
            Service: {service_name or 'Unknown'}
            Time: {datetime.now().isoformat()}
            Message: {message}
            
            Please check the system immediately.
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(email_config['smtp_server'], email_config['smtp_port'])
            server.starttls()
            server.login(email_config['username'], email_config['password'])
            server.send_message(msg)
            server.quit()
            
            logging.info("Email alert sent successfully")
        
        except Exception as e:
            logging.error(f"Failed to send email alert: {e}")
    
    def _send_webhook_alert(self, message: str, level: str, service_name: str):
        """Send webhook alert."""
        try:
            import requests
            
            webhook_config = self.notification_config['webhook']
            
            payload = {
                'timestamp': datetime.now().isoformat(),
                'level': level,
                'service': service_name,
                'message': message,
                'source': 'careconnect_watchdog'
            }
            
            response = requests.post(
                webhook_config['url'],
                json=payload,
                headers=webhook_config.get('headers', {}),
                timeout=10
            )
            
            if response.status_code == 200:
                logging.info("Webhook alert sent successfully")
            else:
                logging.warning(f"Webhook alert failed with status {response.status_code}")
        
        except Exception as e:
            logging.error(f"Failed to send webhook alert: {e}")

# =============================================================================
# Main Watchdog
# =============================================================================

class Watchdog:
    """Main watchdog system."""
    
    def __init__(self, config_path: str = "config.yaml"):
        self.config = WatchdogConfig(config_path)
        self.watchdog_config = self.config.get_watchdog_config()
        
        self.health_monitor = HealthMonitor(self.watchdog_config)
        self.service_manager = ServiceManager(self.watchdog_config)
        self.notification_manager = NotificationManager(self.watchdog_config)
        
        self.running = False
        self.monitoring_thread = None
        self.health_queue = queue.Queue()
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def start(self):
        """Start the watchdog."""
        if self.running:
            logging.warning("Watchdog is already running")
            return
        
        self.running = True
        logging.info("Starting CareConnect AI Engine Watchdog")
        
        # Start monitoring thread
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        
        # Start health reporting thread
        health_thread = threading.Thread(target=self._health_reporting_loop, daemon=True)
        health_thread.start()
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()
    
    def stop(self):
        """Stop the watchdog."""
        logging.info("Stopping CareConnect AI Engine Watchdog")
        self.running = False
        
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        logging.info(f"Received signal {signum}, shutting down")
        self.stop()
    
    def _monitoring_loop(self):
        """Main monitoring loop."""
        check_interval = self.watchdog_config.get('check_interval_seconds', 30)
        
        while self.running:
            try:
                # Check system health
                health_info = self.health_monitor.check_system_health()
                
                # Check for unhealthy services
                unhealthy_services = [
                    service for service in health_info['services']
                    if service['status'] in ['unhealthy', 'error']
                ]
                
                # Handle unhealthy services
                for service in unhealthy_services:
                    service_name = service['name']
                    service_config = self._get_service_config(service_name)
                    
                    if service_config:
                        # Try to restart the service
                        success = self.service_manager.restart_service(service_name, service_config)
                        
                        if not success:
                            # Send alert
                            self.notification_manager.send_alert(
                                f"Service {service_name} is unhealthy and restart failed",
                                'error',
                                service_name
                            )
                
                # Send warning alerts for warning status
                warning_services = [
                    service for service in health_info['services']
                    if service['status'] == 'warning'
                ]
                
                for service in warning_services:
                    self.notification_manager.send_alert(
                        f"Service {service['name']} is showing warning signs",
                        'warning',
                        service['name']
                    )
                
                # Log health metrics if enabled
                if self.watchdog_config.get('log_health_metrics', True):
                    self._log_health_metrics(health_info)
                
                # Wait for next check
                time.sleep(check_interval)
            
            except Exception as e:
                logging.error(f"Error in monitoring loop: {e}")
                time.sleep(check_interval)
    
    def _health_reporting_loop(self):
        """Health reporting loop for external monitoring."""
        while self.running:
            try:
                # Get latest health info
                health_info = self.health_monitor.check_system_health()
                
                # Save to file for external monitoring
                health_file = 'watchdog_health.json'
                with open(health_file, 'w') as f:
                    json.dump(health_info, f, indent=2)
                
                time.sleep(10)  # Update every 10 seconds
            
            except Exception as e:
                logging.error(f"Error in health reporting loop: {e}")
                time.sleep(10)
    
    def _get_service_config(self, service_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific service."""
        monitored_services = self.watchdog_config.get('monitored_services', [])
        
        for service_config in monitored_services:
            if service_config.get('name') == service_name:
                return service_config
        
        return None
    
    def _log_health_metrics(self, health_info: Dict[str, Any]):
        """Log health metrics."""
        try:
            # Create metrics log entry
            log_entry = {
                'timestamp': health_info['timestamp'],
                'overall_status': health_info['overall_status'],
                'system': {
                    'cpu_percent': health_info['system'].get('cpu_percent', 0),
                    'memory_percent': health_info['system'].get('memory_percent', 0),
                    'disk_percent': health_info['system'].get('disk_percent', 0)
                },
                'services': [
                    {
                        'name': service['name'],
                        'status': service['status']
                    }
                    for service in health_info['services']
                ]
            }
            
            # Append to log file
            log_file = 'logs/watchdog_metrics.log'
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
        
        except Exception as e:
            logging.error(f"Failed to log health metrics: {e}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current watchdog status."""
        return {
            'running': self.running,
            'config': self.watchdog_config,
            'health_summary': self.health_monitor.get_health_summary(1),  # Last hour
            'restart_history': self.service_manager.restart_history
        }

# =============================================================================
# Main Functions
# =============================================================================

def main():
    """Main watchdog execution."""
    
    import argparse
    
    parser = argparse.ArgumentParser(description='CareConnect v5.0 AI Engine Watchdog')
    parser.add_argument('--config', type=str, default='config.yaml', help='Configuration file')
    parser.add_argument('--status', action='store_true', help='Show current status')
    parser.add_argument('--health', action='store_true', help='Show health summary')
    parser.add_argument('--daemon', action='store_true', help='Run as daemon')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/watchdog.log'),
            logging.StreamHandler()
        ]
    )
    
    # Create watchdog
    watchdog = Watchdog(args.config)
    
    try:
        if args.status:
            # Show status
            status = watchdog.get_status()
            print(json.dumps(status, indent=2))
        
        elif args.health:
            # Show health summary
            summary = watchdog.health_monitor.get_health_summary(24)
            print(json.dumps(summary, indent=2))
        
        else:
            # Start watchdog
            if args.daemon:
                # Run as daemon
                import daemon
                with daemon.DaemonContext():
                    watchdog.start()
            else:
                # Run in foreground
                watchdog.start()
    
    except Exception as e:
        logging.error(f"Watchdog execution failed: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
