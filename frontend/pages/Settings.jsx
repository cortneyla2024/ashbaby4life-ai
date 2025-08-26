import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import SettingsPanel from '../components/SettingsPanel';
import { SettingsIcon } from '../assets/icons';

const Settings = () => {
    const { user, isAuthenticated } = useAuth();
    const { trackEvent } = useTelemetry();

    React.useEffect(() => {
        trackEvent('settings_page_loaded', {
            isAuthenticated,
            hasUser: !!user
        });
    }, [isAuthenticated, user, trackEvent]);

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1 className="page-title">
                    <SettingsIcon /> Settings
                </h1>
                <p className="page-subtitle">
                    Customize your CareConnect experience and manage your preferences
                </p>
            </div>
            
            <SettingsPanel />
        </div>
    );
};

export default Settings;
