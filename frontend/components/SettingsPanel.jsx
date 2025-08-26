import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTelemetry } from '../hooks/useTelemetry';
import { useAuth } from '../hooks/useAuth';

// Icons
import { 
    CogIcon, 
    UserIcon, 
    BellIcon, 
    ShieldIcon, 
    PaletteIcon,
    GlobeIcon,
    DataIcon,
    HelpIcon,
    SaveIcon,
    ResetIcon
} from '../assets/icons';

const SettingsPanel = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const { settings, updateSettings, resetSettings } = useSettings();
    const { trackEvent } = useTelemetry();
    const { user } = useAuth();

    const tabs = [
        { id: 'general', label: 'General', icon: CogIcon },
        { id: 'profile', label: 'Profile', icon: UserIcon },
        { id: 'notifications', label: 'Notifications', icon: BellIcon },
        { id: 'privacy', label: 'Privacy', icon: ShieldIcon },
        { id: 'appearance', label: 'Appearance', icon: PaletteIcon },
        { id: 'language', label: 'Language', icon: GlobeIcon },
        { id: 'data', label: 'Data', icon: DataIcon },
        { id: 'help', label: 'Help', icon: HelpIcon }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        trackEvent('settings_tab_changed', { tab: tabId });
    };

    const handleSettingChange = (key, value) => {
        updateSettings({ [key]: value });
        trackEvent('setting_changed', { key, value });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings(settings);
            trackEvent('settings_saved');
            // Show success notification
        } catch (error) {
            trackEvent('settings_save_error', { error: error.message });
            // Show error notification
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            resetSettings();
            trackEvent('settings_reset');
        }
    };

    const renderGeneralSettings = () => (
        <div className="settings-section">
            <h3>General Settings</h3>
            
            <div className="setting-group">
                <label className="setting-label">
                    <span>Auto-save</span>
                    <input
                        type="checkbox"
                        checked={settings.autoSave || false}
                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                </label>
                <p className="setting-description">
                    Automatically save changes as you make them
                </p>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Startup Page</span>
                    <select
                        value={settings.startupPage || 'home'}
                        onChange={(e) => handleSettingChange('startupPage', e.target.value)}
                    >
                        <option value="home">Home</option>
                        <option value="dashboard">Dashboard</option>
                        <option value="health">Health</option>
                        <option value="creativity">Creativity</option>
                        <option value="finance">Finance</option>
                        <option value="community">Community</option>
                    </select>
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Session Timeout (minutes)</span>
                    <input
                        type="number"
                        min="5"
                        max="480"
                        value={settings.sessionTimeout || 30}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                </label>
            </div>
        </div>
    );

    const renderProfileSettings = () => (
        <div className="settings-section">
            <h3>Profile Settings</h3>
            
            <div className="setting-group">
                <label className="setting-label">
                    <span>Display Name</span>
                    <input
                        type="text"
                        value={settings.displayName || user?.name || ''}
                        onChange={(e) => handleSettingChange('displayName', e.target.value)}
                        placeholder="Enter your display name"
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Email</span>
                    <input
                        type="email"
                        value={settings.email || user?.email || ''}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                        placeholder="Enter your email"
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Bio</span>
                    <textarea
                        value={settings.bio || ''}
                        onChange={(e) => handleSettingChange('bio', e.target.value)}
                        placeholder="Tell us about yourself"
                        rows="3"
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Time Zone</span>
                    <select
                        value={settings.timezone || 'UTC'}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                </label>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="settings-section">
            <h3>Notification Settings</h3>
            
            <div className="setting-group">
                <label className="setting-label">
                    <span>Push Notifications</span>
                    <input
                        type="checkbox"
                        checked={settings.pushNotifications || false}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Email Notifications</span>
                    <input
                        type="checkbox"
                        checked={settings.emailNotifications || false}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Sound Notifications</span>
                    <input
                        type="checkbox"
                        checked={settings.soundNotifications || false}
                        onChange={(e) => handleSettingChange('soundNotifications', e.target.checked)}
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Daily Summary</span>
                    <input
                        type="checkbox"
                        checked={settings.dailySummary || false}
                        onChange={(e) => handleSettingChange('dailySummary', e.target.checked)}
                    />
                </label>
            </div>
        </div>
    );

    const renderPrivacySettings = () => (
        <div className="settings-section">
            <h3>Privacy Settings</h3>
            
            <div className="setting-group">
                <label className="setting-label">
                    <span>Data Collection</span>
                    <input
                        type="checkbox"
                        checked={settings.dataCollection || false}
                        onChange={(e) => handleSettingChange('dataCollection', e.target.checked)}
                    />
                </label>
                <p className="setting-description">
                    Allow us to collect anonymous usage data to improve the service
                </p>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Analytics</span>
                    <input
                        type="checkbox"
                        checked={settings.analytics || false}
                        onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Auto-logout on inactivity</span>
                    <input
                        type="checkbox"
                        checked={settings.autoLogout || true}
                        onChange={(e) => handleSettingChange('autoLogout', e.target.checked)}
                    />
                </label>
            </div>
        </div>
    );

    const renderAppearanceSettings = () => (
        <div className="settings-section">
            <h3>Appearance Settings</h3>
            
            <div className="setting-group">
                <label className="setting-label">
                    <span>Theme</span>
                    <select
                        value={settings.theme || 'system'}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Font Size</span>
                    <select
                        value={settings.fontSize || 'medium'}
                        onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Compact Mode</span>
                    <input
                        type="checkbox"
                        checked={settings.compactMode || false}
                        onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    />
                </label>
            </div>
        </div>
    );

    const renderLanguageSettings = () => (
        <div className="settings-section">
            <h3>Language Settings</h3>
            
            <div className="setting-group">
                <label className="setting-label">
                    <span>Language</span>
                    <select
                        value={settings.language || 'en'}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                        <option value="pt">Português</option>
                        <option value="ru">Русский</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                    </select>
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Date Format</span>
                    <select
                        value={settings.dateFormat || 'MM/DD/YYYY'}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </label>
            </div>
        </div>
    );

    const renderDataSettings = () => (
        <div className="settings-section">
            <h3>Data Settings</h3>
            
            <div className="setting-group">
                <label className="setting-label">
                    <span>Auto-backup</span>
                    <input
                        type="checkbox"
                        checked={settings.autoBackup || true}
                        onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                </label>
            </div>

            <div className="setting-group">
                <label className="setting-label">
                    <span>Backup Frequency</span>
                    <select
                        value={settings.backupFrequency || 'daily'}
                        onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                    >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </label>
            </div>

            <div className="setting-group">
                <button className="setting-action" onClick={() => trackEvent('data_export_requested')}>
                    Export Data
                </button>
                <button className="setting-action" onClick={() => trackEvent('data_import_requested')}>
                    Import Data
                </button>
            </div>
        </div>
    );

    const renderHelpSettings = () => (
        <div className="settings-section">
            <h3>Help & Support</h3>
            
            <div className="setting-group">
                <button className="setting-action" onClick={() => trackEvent('help_documentation_opened')}>
                    Documentation
                </button>
                <button className="setting-action" onClick={() => trackEvent('help_tutorial_opened')}>
                    Tutorial
                </button>
                <button className="setting-action" onClick={() => trackEvent('help_faq_opened')}>
                    FAQ
                </button>
                <button className="setting-action" onClick={() => trackEvent('help_contact_opened')}>
                    Contact Support
                </button>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings();
            case 'profile':
                return renderProfileSettings();
            case 'notifications':
                return renderNotificationSettings();
            case 'privacy':
                return renderPrivacySettings();
            case 'appearance':
                return renderAppearanceSettings();
            case 'language':
                return renderLanguageSettings();
            case 'data':
                return renderDataSettings();
            case 'help':
                return renderHelpSettings();
            default:
                return renderGeneralSettings();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="settings-panel">
            <div className="settings-container">
                {/* Header */}
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="settings-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="settings-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => handleTabChange(tab.id)}
                            >
                                <Icon />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="settings-content">
                    {renderTabContent()}
                </div>

                {/* Footer */}
                <div className="settings-footer">
                    <button
                        className="settings-button secondary"
                        onClick={handleReset}
                        disabled={isSaving}
                    >
                        <ResetIcon />
                        Reset
                    </button>
                    <button
                        className="settings-button primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <SaveIcon />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
