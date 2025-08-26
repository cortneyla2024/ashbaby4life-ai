"use client";

import React from "react";
import PersonaManager from "@/components/settings/PersonaManager";

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Customize your AI Life Companion experience and manage your preferences.
          </p>
        </div>

        <div className="space-y-8">
          <PersonaManager />

          {/* Additional settings sections can be added here */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
            <p className="text-gray-600 mb-4">
              Manage your account preferences and security settings.
            </p>
            <div className="text-sm text-gray-500">
              Additional account settings will be available in future updates.
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Data</h2>
            <p className="text-gray-600 mb-4">
              Control your data privacy and export options.
            </p>
            <div className="text-sm text-gray-500">
              Privacy controls and data export features will be available in future updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
