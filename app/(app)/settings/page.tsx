'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Bell, Monitor, Database, Shield, Globe } from 'lucide-react';
import { useStore } from '@/store/index';

type SettingsSection = 'profile' | 'notifications' | 'display' | 'data' | 'security' | 'system';

type SettingsToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
};

const SettingsToggle = ({ checked, onChange }: SettingsToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
        checked ? 'bg-blue text-white border-blue' : 'bg-gray-200 text-muted-foreground border-border'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="h-4 w-4 rounded-full bg-card shadow-md"
        style={{ marginLeft: checked ? '22px' : '2px' }}
      />
    </button>
  );
};

const SECTION_TITLE = 'text-xl font-light tracking-tight text-foreground mb-4';
const SECTION_META =
  'text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2';
const SECTION_META_BLUE =
  'text-[10px] font-mono uppercase tracking-[0.18em] text-blue mb-2';
const SECTION_META_AMBER =
  'text-[10px] font-mono uppercase tracking-[0.18em] text-amber mb-2';

const FIELD_LABEL =
  'block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1';
const INPUT_BASE =
  'w-full px-3 py-2 text-sm bg-white/80 dark:bg-zinc-950/40 border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue disabled:opacity-50';
const TEXTAREA_BASE = `${INPUT_BASE} resize-none`;
const SELECT_BASE = INPUT_BASE;

const SETTING_TITLE = 'text-sm font-medium text-foreground';
const SETTING_DESC = 'text-xs text-muted-foreground mt-1';

const ACTION_BUTTON =
  'w-full px-4 py-3 text-[11px] font-mono uppercase tracking-[0.16em] border border-border bg-transparent text-foreground hover:bg-zinc-100/60 dark:hover:bg-zinc-900 transition-colors';
const DANGER_BUTTON =
  'w-full px-4 py-3 text-[11px] font-mono uppercase tracking-[0.16em] border border-red bg-red/5 text-red hover:bg-red/10 transition-colors';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { userProfile, isLoadingProfile, setUserProfile } = useStore();
  const weatherViewMode = useStore((s) => s.weatherViewMode);
  const setWeatherViewMode = useStore((s) => s.setWeatherViewMode);

  // Profile settings initialized from user profile
  const [profileSettings, setProfileSettings] = useState({
    display_name: '',
    username: '',
    email: '',
    phone: '',
    affiliated_organization: '',
    timezone: 'UTC',
    bio: '',
  });

  // Initialize form with user profile data
  useEffect(() => {
    if (userProfile) {
      setProfileSettings({
        display_name: userProfile.display_name || '',
        username: userProfile.username || '',
        email: 'user@flightops.io', // Placeholder - email not in profile type
        phone: userProfile.phone || '',
        affiliated_organization: userProfile.affiliated_organization || '',
        timezone: userProfile.timezone || 'UTC',
        bio: userProfile.bio || '',
      });
    }
  }, [userProfile]);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    weatherAlerts: true,
    flightUpdates: true,
    systemAlerts: true,
    emailNotifications: false,
    soundEnabled: true,
  });

  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light',
    compactMode: false,
    showBadges: true,
    sidebarExpanded: false,
    unitSystem: 'imperial',
  });

  // Data settings
  const [dataSettings, setDataSettings] = useState({
    autoSave: true,
    cacheEnabled: true,
    dataRetention: '30',
  });

  const sections = [
    { id: 'profile' as SettingsSection, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
    { id: 'display' as SettingsSection, label: 'Display', icon: Monitor },
    { id: 'data' as SettingsSection, label: 'Data', icon: Database },
    { id: 'security' as SettingsSection, label: 'Security', icon: Shield },
    { id: 'system' as SettingsSection, label: 'System', icon: Globe },
  ];

  const handleSave = async () => {
    if (!userProfile) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Update only the profile fields that are editable
      const updatedProfile = {
        ...userProfile,
        display_name: profileSettings.display_name,
        username: profileSettings.username,
        phone: profileSettings.phone,
        affiliated_organization: profileSettings.affiliated_organization,
        timezone: profileSettings.timezone,
        bio: profileSettings.bio,
      };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const savedProfile = await response.json();
      setUserProfile(savedProfile);
      setHasChanges(false);
      setSaveMessage('Profile saved successfully!');

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile. Please try again.');

      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const isError = saveMessage?.toLowerCase().includes('error');
  const isSuccess = saveMessage && !isError;

  return (
    <div className="min-h-full bg-[#e8e8e8] dark:bg-zinc-950">
      <div className="relative h-full px-6 md:px-8 py-8">
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" aria-hidden />

        <div className="relative h-full corner-brackets corner-brackets-lg corner-brackets-default">
          <div className="corner-brackets-inner h-full p-6 md:p-8 bg-surface/80 dark:bg-zinc-900/80 backdrop-blur-md space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground mb-1">
                  User Control Panel
                </p>
                <h1 className="text-2xl font-light tracking-tight text-foreground">Settings</h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span>{hasChanges ? 'Unsaved changes' : 'Profile synced'}</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              {/* Sidebar Navigation */}
              <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="glass-panel rounded-sm p-4 h-full">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                      Sections
                    </span>
                    <span className="text-[10px] font-mono text-blue">
                      {sections.length.toString().padStart(2, '0')} ITEMS
                    </span>
                  </div>
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-sm border-l-2 transition-colors text-xs font-medium ${
                            isActive
                              ? 'border-blue bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-zinc-100/60 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-background">
                              <Icon size={14} />
                            </span>
                            <span>{section.label}</span>
                          </span>
                          <span className="hidden md:inline text-[10px] font-mono opacity-60">
                            {section.id.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 flex flex-col">
                <div className="glass-panel rounded-sm p-6 md:p-8 flex-1">
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div>
                  <p className={SECTION_META}>Profile</p>
                  <h2 className={SECTION_TITLE}>Profile Information</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={FIELD_LABEL}>Display Name</label>
                        <input
                          type="text"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.display_name}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, display_name: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className={INPUT_BASE}
                        />
                      </div>

                      <div>
                        <label className={FIELD_LABEL}>Username</label>
                        <input
                          type="text"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.username}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, username: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className={`${INPUT_BASE} font-mono`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={FIELD_LABEL}>Email Address</label>
                      <input
                        type="email"
                        value={profileSettings.email}
                        disabled
                        className={`${INPUT_BASE} bg-background-secondary disabled:bg-background-secondary`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed here. Contact support if needed.
                      </p>
                    </div>

                    <div>
                      <label className={FIELD_LABEL}>Bio</label>
                      <textarea
                        value={isLoadingProfile ? 'Loading...' : profileSettings.bio}
                        onChange={(e) => {
                          setProfileSettings({ ...profileSettings, bio: e.target.value });
                          setHasChanges(true);
                        }}
                        disabled={isLoadingProfile}
                        rows={3}
                        className={TEXTAREA_BASE}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={FIELD_LABEL}>Phone Number</label>
                        <input
                          type="tel"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.phone}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, phone: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className={`${INPUT_BASE} font-mono`}
                        />
                      </div>

                      <div>
                        <label className={FIELD_LABEL}>Organization</label>
                        <input
                          type="text"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.affiliated_organization}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, affiliated_organization: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className={INPUT_BASE}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={FIELD_LABEL}>Default Timezone</label>
                        <select
                          value={isLoadingProfile ? 'UTC' : profileSettings.timezone}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, timezone: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className={SELECT_BASE}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern (ET)</option>
                          <option value="America/Chicago">Central (CT)</option>
                          <option value="America/Denver">Mountain (MT)</option>
                          <option value="America/Los_Angeles">Pacific (PT)</option>
                          <option value="Europe/London">London (GMT/BST)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === 'notifications' && (
                <div>
                  <p className={SECTION_META_BLUE}>Notifications</p>
                  <h2 className={SECTION_TITLE}>Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className={SETTING_TITLE}>Weather Alerts</div>
                        <div className={SETTING_DESC}>
                          Receive notifications for weather changes affecting your flights
                        </div>
                      </div>
                      <SettingsToggle
                        checked={notificationSettings.weatherAlerts}
                        onChange={(next) => {
                          setNotificationSettings({ ...notificationSettings, weatherAlerts: next });
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className={SETTING_TITLE}>Flight Updates</div>
                        <div className={SETTING_DESC}>
                          Get notified about flight status changes and updates
                        </div>
                      </div>
                      <SettingsToggle
                        checked={notificationSettings.flightUpdates}
                        onChange={(next) => {
                          setNotificationSettings({ ...notificationSettings, flightUpdates: next });
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className={SETTING_TITLE}>System Alerts</div>
                        <div className={SETTING_DESC}>
                          Critical system notifications and warnings
                        </div>
                      </div>
                      <SettingsToggle
                        checked={notificationSettings.systemAlerts}
                        onChange={(next) => {
                          setNotificationSettings({ ...notificationSettings, systemAlerts: next });
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className={SETTING_TITLE}>Email Notifications</div>
                        <div className={SETTING_DESC}>
                          Send notification summaries to your email
                        </div>
                      </div>
                      <SettingsToggle
                        checked={notificationSettings.emailNotifications}
                        onChange={(next) => {
                          setNotificationSettings({ ...notificationSettings, emailNotifications: next });
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className={SETTING_TITLE}>Sound Enabled</div>
                        <div className={SETTING_DESC}>
                          Play sound for notifications
                        </div>
                      </div>
                      <SettingsToggle
                        checked={notificationSettings.soundEnabled}
                        onChange={(next) => {
                          setNotificationSettings({ ...notificationSettings, soundEnabled: next });
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeSection === 'display' && (
                <div>
                  <p className={SECTION_META_BLUE}>Interface</p>
                  <h2 className={SECTION_TITLE}>Display &amp; Appearance</h2>

                  <div className="space-y-6">
                    {/* Weather View Mode */}
                    <div>
                      <label className={FIELD_LABEL}>Weather View Mode</label>
                      <div className="flex gap-3">
                        {([
                          { id: 'standard', label: 'Standard (Accessible)' },
                          { id: 'advanced', label: 'Advanced (Landscape)' },
                        ] as const).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setWeatherViewMode(opt.id)}
                            className={`px-4 py-2 text-[11px] font-mono uppercase tracking-[0.14em] border transition-colors ${
                              weatherViewMode === opt.id
                                ? 'border-blue bg-blue text-white'
                                : 'border-border  text-muted-foreground hover:text-foreground hover:border-text-primary'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className={SETTING_DESC}>
                        Standard balances detail and legibility. Switch to Advanced for dense, landscape cockpit view.
                      </p>
                    </div>

                    <div>
                      <label className={FIELD_LABEL}>Theme</label>
                      <p className={SETTING_DESC}>
                        Choose your preferred color scheme or use system preference
                      </p>
                    </div>

                    <div>
                      <label className={FIELD_LABEL}>Unit System</label>
                      <div className="flex gap-3">
                        {['imperial', 'metric'].map((unit) => (
                          <button
                            key={unit}
                            onClick={() => {
                              setDisplaySettings({ ...displaySettings, unitSystem: unit });
                              setHasChanges(true);
                            }}
                            className={`
                              px-6 py-2 text-[11px] font-mono uppercase tracking-[0.14em] border transition-colors
                              ${
                                displaySettings.unitSystem === unit
                                  ? 'border-blue bg-blue text-white'
                                  : 'border-border  text-muted-foreground hover:text-foreground hover:border-text-primary'
                              }
                            `}
                          >
                            {unit === 'imperial' ? 'Imperial (ft, kt)' : 'Metric (m, km/h)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border ">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={SETTING_TITLE}>Compact Mode</div>
                          <div className={SETTING_DESC}>
                            Reduce spacing and padding throughout the interface
                          </div>
                        </div>
                        <SettingsToggle
                          checked={displaySettings.compactMode}
                          onChange={(next) => {
                            setDisplaySettings({ ...displaySettings, compactMode: next });
                            setHasChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className={SETTING_TITLE}>Show Badges</div>
                          <div className={SETTING_DESC}>
                            Display notification badges on navigation items
                          </div>
                        </div>
                        <SettingsToggle
                          checked={displaySettings.showBadges}
                          onChange={(next) => {
                            setDisplaySettings({ ...displaySettings, showBadges: next });
                            setHasChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className={SETTING_TITLE}>Sidebar Expanded by Default</div>
                          <div className={SETTING_DESC}>
                            Keep the sidebar expanded on page load
                          </div>
                        </div>
                        <SettingsToggle
                          checked={displaySettings.sidebarExpanded}
                          onChange={(next) => {
                            setDisplaySettings({ ...displaySettings, sidebarExpanded: next });
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Settings */}
              {activeSection === 'data' && (
                <div>
                  <p className={SECTION_META_AMBER}>Storage &amp; Retention</p>
                  <h2 className={SECTION_TITLE}>Data Management</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className={SETTING_TITLE}>Auto-Save</div>
                        <div className={SETTING_DESC}>
                          Automatically save changes as you work
                        </div>
                      </div>
                      <SettingsToggle
                        checked={dataSettings.autoSave}
                        onChange={(next) => {
                          setDataSettings({ ...dataSettings, autoSave: next });
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className={SETTING_TITLE}>Cache Enabled</div>
                        <div className={SETTING_DESC}>
                          Store data locally for faster access
                        </div>
                      </div>
                      <SettingsToggle
                        checked={dataSettings.cacheEnabled}
                        onChange={(next) => {
                          setDataSettings({ ...dataSettings, cacheEnabled: next });
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div>
                      <label className={FIELD_LABEL}>Data Retention Period</label>
                      <select
                        value={dataSettings.dataRetention}
                        onChange={(e) => {
                          setDataSettings({ ...dataSettings, dataRetention: e.target.value });
                          setHasChanges(true);
                        }}
                        className={SELECT_BASE}
                      >
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="365">1 year</option>
                        <option value="-1">Forever</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-2">
                        How long to keep historical data before automatic cleanup
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border  space-y-3">
                      <button className={ACTION_BUTTON}>Export All Data</button>
                      <button className={ACTION_BUTTON}>Clear Cache</button>
                      <button className={DANGER_BUTTON}>Delete All Data</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div>
                  <p className={SECTION_META}>Security</p>
                  <h2 className={SECTION_TITLE}>Security &amp; Privacy</h2>

                  <div className="space-y-6">
                    <div>
                      <button className={`${ACTION_BUTTON} text-left`}>
                        Change Password
                      </button>
                    </div>

                    <div>
                      <button className={`${ACTION_BUTTON} text-left`}>
                        Two-Factor Authentication
                      </button>
                      <p className="text-xs text-muted-foreground mt-2 px-4">
                        Not enabled · Recommended for enhanced security
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border ">
                      <h3 className="text-sm font-medium text-foreground mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="p-4 border border-border ">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={SETTING_TITLE}>Current Session</div>
                              <div className={SETTING_DESC}>
                                Chrome on macOS · San Francisco, CA
                              </div>
                            </div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-green">Active</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border ">
                      <button className={DANGER_BUTTON}>Sign Out All Devices</button>
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeSection === 'system' && (
                <div>
                  <p className={SECTION_META}>System</p>
                  <h2 className={SECTION_TITLE}>System Information</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-border bg-background/60">
                        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-1">Version</div>
                        <div className="text-sm font-mono text-foreground">1.0.0</div>
                      </div>
                      <div className="p-4 border border-border bg-background/60">
                        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-1">Build</div>
                        <div className="text-sm font-mono text-foreground">20250111</div>
                      </div>
                      <div className="p-4 border border-border bg-background/60">
                        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-1">Environment</div>
                        <div className="text-sm font-mono text-foreground">Production</div>
                      </div>
                      <div className="p-4 border border-border bg-background/60">
                        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-1">Status</div>
                        <div className="text-sm font-mono text-green">Operational</div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border  space-y-3">
                      <button className={ACTION_BUTTON}>Check for Updates</button>
                      <button className={ACTION_BUTTON}>View Documentation</button>
                      <button className={ACTION_BUTTON}>Report an Issue</button>
                    </div>

                    <div className="pt-6 border-t border-border ">
                      <div className="text-xs text-muted-foreground">
                        <p className="mb-2">© 2025 FlightOps. All rights reserved.</p>
                        <p>Built with Next.js, React, and TypeScript.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                </div>

                {/* Save Bar */}
                {(hasChanges || saveMessage) && (
                  <div
                    className={`mt-6 glass-panel rounded-sm px-4 py-3 flex items-center justify-between text-[11px] font-mono border-l-4 ${
                      isError
                        ? 'border-l-red-500'
                        : isSuccess
                          ? 'border-l-emerald-500'
                          : 'border-l-amber-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isError
                            ? 'bg-red-500'
                            : isSuccess
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                        }`}
                      />
                      <span>{saveMessage || 'UNSAVED CHANGES'}</span>
                    </div>

                    {!saveMessage && (
                      <div className="flex gap-3 text-[11px] tracking-widest uppercase">
                        <button
                          onClick={() => setHasChanges(false)}
                          className="px-3 py-1 border border-border bg-transparent text-foreground hover:bg-zinc-100/60 dark:hover:bg-zinc-900 transition-colors"
                        >
                          Discard
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-3 py-1 bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-60"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-3 h-3 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                              <span>Saving</span>
                            </>
                          ) : (
                            <>
                              <Save size={14} />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
