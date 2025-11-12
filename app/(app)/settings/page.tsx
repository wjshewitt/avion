'use client';

import { useState, useEffect } from 'react';
import { Save, User, Bell, Monitor, Database, Shield, Globe } from 'lucide-react';
import { useStore } from '@/store/index';
import type { UserProfile } from '@/types/profile';

type SettingsSection = 'profile' | 'notifications' | 'display' | 'data' | 'security' | 'system';

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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-border ">
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-56 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
                      border-l-2 transition-colors
                      ${
                        activeSection === section.id
                          ? 'border-blue bg-blue/5 text-blue'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-surface'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-card  border border-border  p-8">
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.display_name}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, display_name: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.username}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, username: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue font-mono disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileSettings.email}
                        disabled
                        className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue disabled:opacity-50 bg-gray-50 "
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed here. Contact support if needed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Bio
                      </label>
                      <textarea
                        value={isLoadingProfile ? 'Loading...' : profileSettings.bio}
                        onChange={(e) => {
                          setProfileSettings({ ...profileSettings, bio: e.target.value });
                          setHasChanges(true);
                        }}
                        disabled={isLoadingProfile}
                        rows={3}
                        className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue disabled:opacity-50 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.phone}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, phone: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue font-mono disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={isLoadingProfile ? 'Loading...' : profileSettings.affiliated_organization}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, affiliated_organization: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Default Timezone
                        </label>
                        <select
                          value={isLoadingProfile ? 'UTC' : profileSettings.timezone}
                          onChange={(e) => {
                            setProfileSettings({ ...profileSettings, timezone: e.target.value });
                            setHasChanges(true);
                          }}
                          disabled={isLoadingProfile}
                          className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue disabled:opacity-50"
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
                  <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Weather Alerts</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Receive notifications for weather changes affecting your flights
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.weatherAlerts}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, weatherAlerts: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Flight Updates</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Get notified about flight status changes and updates
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.flightUpdates}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, flightUpdates: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className="text-sm font-semibold text-foreground">System Alerts</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Critical system notifications and warnings
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.systemAlerts}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Email Notifications</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Send notification summaries to your email
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Sound Enabled</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Play sound for notifications
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.soundEnabled}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, soundEnabled: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeSection === 'display' && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Display & Appearance</h2>
                  
                  <div className="space-y-6">
                    {/* Weather View Mode */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Weather View Mode
                      </label>
                      <div className="flex gap-3">
                        {([
                          { id: 'standard', label: 'Standard (Accessible)' },
                          { id: 'advanced', label: 'Advanced (Landscape)' },
                        ] as const).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setWeatherViewMode(opt.id)}
                            className={`px-4 py-2 text-sm font-medium border transition-colors ${
                              weatherViewMode === opt.id
                                ? 'border-blue bg-blue text-white'
                                : 'border-border  text-muted-foreground hover:text-foreground hover:border-text-primary'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Standard balances detail and legibility. Switch to Advanced for dense, landscape cockpit view.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">
                        Theme
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">
                        Choose your preferred color scheme or use system preference
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Unit System
                      </label>
                      <div className="flex gap-3">
                        {['imperial', 'metric'].map((unit) => (
                          <button
                            key={unit}
                            onClick={() => {
                              setDisplaySettings({ ...displaySettings, unitSystem: unit });
                              setHasChanges(true);
                            }}
                            className={`
                              px-6 py-2 text-sm font-medium border transition-colors
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
                          <div className="text-sm font-semibold text-foreground">Compact Mode</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Reduce spacing and padding throughout the interface
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={displaySettings.compactMode}
                            onChange={(e) => {
                              setDisplaySettings({ ...displaySettings, compactMode: e.target.checked });
                              setHasChanges(true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-foreground">Show Badges</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Display notification badges on navigation items
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={displaySettings.showBadges}
                            onChange={(e) => {
                              setDisplaySettings({ ...displaySettings, showBadges: e.target.checked });
                              setHasChanges(true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-foreground">Sidebar Expanded by Default</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Keep the sidebar expanded on page load
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={displaySettings.sidebarExpanded}
                            onChange={(e) => {
                              setDisplaySettings({ ...displaySettings, sidebarExpanded: e.target.checked });
                              setHasChanges(true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Settings */}
              {activeSection === 'data' && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Data Management</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Auto-Save</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Automatically save changes as you work
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dataSettings.autoSave}
                          onChange={(e) => {
                            setDataSettings({ ...dataSettings, autoSave: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border ">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Cache Enabled</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Store data locally for faster access
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dataSettings.cacheEnabled}
                          onChange={(e) => {
                            setDataSettings({ ...dataSettings, cacheEnabled: e.target.checked });
                            setHasChanges(true);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue border border-border  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card  after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Data Retention Period
                      </label>
                      <select
                        value={dataSettings.dataRetention}
                        onChange={(e) => {
                          setDataSettings({ ...dataSettings, dataRetention: e.target.value });
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-border  text-sm focus:outline-none focus:border-blue"
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
                      <button className="w-full px-4 py-3 border border-border  text-sm font-medium text-foreground hover:bg-surface  transition-colors">
                        Export All Data
                      </button>
                      <button className="w-full px-4 py-3 border border-border  text-sm font-medium text-foreground hover:bg-surface  transition-colors">
                        Clear Cache
                      </button>
                      <button className="w-full px-4 py-3 border border-red bg-red/5 text-sm font-medium text-red hover:bg-red/10 transition-colors">
                        Delete All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Security & Privacy</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <button className="w-full px-4 py-3 border border-border  text-sm font-medium text-foreground hover:bg-surface  transition-colors text-left">
                        Change Password
                      </button>
                    </div>

                    <div>
                      <button className="w-full px-4 py-3 border border-border  text-sm font-medium text-foreground hover:bg-surface  transition-colors text-left">
                        Two-Factor Authentication
                      </button>
                      <p className="text-xs text-muted-foreground mt-2 px-4">
                        Not enabled · Recommended for enhanced security
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border ">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="p-4 border border-border ">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-foreground">Current Session</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Chrome on macOS · San Francisco, CA
                              </div>
                            </div>
                            <div className="text-xs text-green font-semibold">ACTIVE</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border ">
                      <button className="w-full px-4 py-3 border border-red bg-red/5 text-sm font-medium text-red hover:bg-red/10 transition-colors">
                        Sign Out All Devices
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeSection === 'system' && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">System Information</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-border ">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Version</div>
                        <div className="text-sm font-mono text-foreground">1.0.0</div>
                      </div>
                      <div className="p-4 border border-border ">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Build</div>
                        <div className="text-sm font-mono text-foreground">20250111</div>
                      </div>
                      <div className="p-4 border border-border ">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Environment</div>
                        <div className="text-sm font-mono text-foreground">Production</div>
                      </div>
                      <div className="p-4 border border-border ">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Status</div>
                        <div className="text-sm font-mono text-green">Operational</div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border  space-y-3">
                      <button className="w-full px-4 py-3 border border-border  text-sm font-medium text-foreground hover:bg-surface  transition-colors">
                        Check for Updates
                      </button>
                      <button className="w-full px-4 py-3 border border-border  text-sm font-medium text-foreground hover:bg-surface  transition-colors">
                        View Documentation
                      </button>
                      <button className="w-full px-4 py-3 border border-border  text-sm font-medium text-foreground hover:bg-surface  transition-colors">
                        Report an Issue
                      </button>
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
              <div className={`mt-4 p-4 border flex items-center justify-between ${
                saveMessage?.includes('Error')
                  ? 'bg-red border-red'
                  : saveMessage
                    ? 'bg-green border-green'
                    : 'bg-blue border-blue'
              }`}>
                <div className="text-sm text-white">
                  {saveMessage || 'You have unsaved changes'}
                </div>
                {!saveMessage && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setHasChanges(false)}
                      className="px-4 py-2 border border-white text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-card  text-blue text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
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
  );
}
