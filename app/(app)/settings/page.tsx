'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Bell, Monitor, Database, Shield, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStore } from '@/store/index';

type SettingsSection = 'profile' | 'notifications' | 'display' | 'data' | 'security' | 'system';

const SettingsToggle = ({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void; }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
        checked ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
        style={{ x: checked ? 22 : 2 }}
      />
    </button>
  );
};

const FIELD_LABEL = 'block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2';
const INPUT_BASE = 'w-full bg-transparent px-4 py-2.5 border-none text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none';
const TEXTAREA_BASE = `${INPUT_BASE} resize-none`;
const SELECT_BASE = 'w-full appearance-none bg-transparent px-4 py-2.5 border-none text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none';

const SETTING_TITLE = 'text-sm font-medium text-foreground';
const SETTING_DESC = 'text-xs text-muted-foreground mt-1';

const ACTION_BUTTON = 'w-full px-4 py-2 text-xs font-mono uppercase tracking-widest border border-border bg-background hover:bg-accent transition-colors rounded-sm';
const DANGER_BUTTON = 'w-full px-4 py-2 text-xs font-mono uppercase tracking-widest border border-red/50 bg-red/10 text-red hover:bg-red/20 transition-colors rounded-sm';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { theme, setTheme } = useTheme();
  const { userProfile, isLoadingProfile, setUserProfile } = useStore();
  const weatherViewMode = useStore((s) => s.weatherViewMode);
  const setWeatherViewMode = useStore((s) => s.setWeatherViewMode);

  const [profileSettings, setProfileSettings] = useState({
    display_name: '',
    username: '',
    email: '',
    phone: '',
    affiliated_organization: '',
    timezone: 'UTC',
    bio: '',
  });

  useEffect(() => {
    if (userProfile) {
      setProfileSettings({
        display_name: userProfile.display_name || '',
        username: userProfile.username || '',
        email: 'user@flightops.io',
        phone: userProfile.phone || '',
        affiliated_organization: userProfile.affiliated_organization || '',
        timezone: userProfile.timezone || 'UTC',
        bio: userProfile.bio || '',
      });
      if (userProfile.theme_preference && userProfile.theme_preference !== theme) {
        setTheme(userProfile.theme_preference);
      }
    }
  }, [userProfile, theme, setTheme]);

  const [notificationSettings, setNotificationSettings] = useState({
    weatherAlerts: true,
    flightUpdates: true,
    systemAlerts: true,
    emailNotifications: false,
    soundEnabled: true,
  });

  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    showBadges: true,
    sidebarExpanded: false,
    unitSystem: 'imperial',
  });

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
      const updatedProfile = {
        ...userProfile,
        display_name: profileSettings.display_name,
        username: profileSettings.username,
        phone: profileSettings.phone,
        affiliated_organization: profileSettings.affiliated_organization,
        timezone: profileSettings.timezone,
        bio: profileSettings.bio,
        theme_preference: theme || 'light',
      };
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      const savedProfile = await response.json();
      setUserProfile(savedProfile.profile);
      setHasChanges(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const isError = saveMessage?.toLowerCase().includes('error');
  const isSuccess = saveMessage && !isError;

  return (
    <div className="flex-1 overflow-auto p-8 bg-background">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
            USER CONTROL PANEL
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Settings
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className={`w-2 h-2 rounded-full ${hasChanges ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span>{hasChanges ? 'Unsaved changes' : 'Profile synced'}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-sm p-6 md:p-8">
            {activeSection === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Profile Information</h2>
                <p className="text-muted-foreground text-sm mb-6">Manage your personal details and preferences.</p>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={FIELD_LABEL}>Display Name</label>
                      <div className="groove-input">
                        <input type="text" value={isLoadingProfile ? 'Loading...' : profileSettings.display_name} onChange={(e) => { setProfileSettings({ ...profileSettings, display_name: e.target.value }); setHasChanges(true); }} disabled={isLoadingProfile} className={INPUT_BASE} />
                      </div>
                    </div>
                    <div>
                      <label className={FIELD_LABEL}>Username</label>
                      <div className="groove-input">
                        <input type="text" value={isLoadingProfile ? 'Loading...' : profileSettings.username} onChange={(e) => { setProfileSettings({ ...profileSettings, username: e.target.value }); setHasChanges(true); }} disabled={isLoadingProfile} className={`${INPUT_BASE} font-mono`} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Email Address</label>
                    <div className="groove-input">
                      <input type="email" value={profileSettings.email} disabled className={`${INPUT_BASE} bg-muted`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Email cannot be changed. Contact support if needed.</p>
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Bio</label>
                    <div className="groove-input">
                      <textarea value={isLoadingProfile ? 'Loading...' : profileSettings.bio} onChange={(e) => { setProfileSettings({ ...profileSettings, bio: e.target.value }); setHasChanges(true); }} disabled={isLoadingProfile} rows={3} className={TEXTAREA_BASE} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={FIELD_LABEL}>Phone Number</label>
                      <div className="groove-input">
                        <input type="tel" value={isLoadingProfile ? 'Loading...' : profileSettings.phone} onChange={(e) => { setProfileSettings({ ...profileSettings, phone: e.target.value }); setHasChanges(true); }} disabled={isLoadingProfile} className={`${INPUT_BASE} font-mono`} />
                      </div>
                    </div>
                    <div>
                      <label className={FIELD_LABEL}>Organization</label>
                      <div className="groove-input">
                        <input type="text" value={isLoadingProfile ? 'Loading...' : profileSettings.affiliated_organization} onChange={(e) => { setProfileSettings({ ...profileSettings, affiliated_organization: e.target.value }); setHasChanges(true); }} disabled={isLoadingProfile} className={INPUT_BASE} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Default Timezone</label>
                    <div className="groove-input">
                      <select value={isLoadingProfile ? 'UTC' : profileSettings.timezone} onChange={(e) => { setProfileSettings({ ...profileSettings, timezone: e.target.value }); setHasChanges(true); }} disabled={isLoadingProfile} className={SELECT_BASE}>
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

            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Notification Preferences</h2>
                <p className="text-muted-foreground text-sm mb-6">Choose how you want to be notified.</p>
                <div className="space-y-4 divide-y divide-border">
                  <div className="flex items-center justify-between pt-4 first:pt-0">
                    <div>
                      <div className={SETTING_TITLE}>Weather Alerts</div>
                      <div className={SETTING_DESC}>Receive notifications for weather changes affecting your flights.</div>
                    </div>
                    <SettingsToggle checked={notificationSettings.weatherAlerts} onChange={(next) => { setNotificationSettings({ ...notificationSettings, weatherAlerts: next }); setHasChanges(true); }} />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <div className={SETTING_TITLE}>Flight Updates</div>
                      <div className={SETTING_DESC}>Get notified about flight status changes and updates.</div>
                    </div>
                    <SettingsToggle checked={notificationSettings.flightUpdates} onChange={(next) => { setNotificationSettings({ ...notificationSettings, flightUpdates: next }); setHasChanges(true); }} />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <div className={SETTING_TITLE}>System Alerts</div>
                      <div className={SETTING_DESC}>Critical system notifications and warnings.</div>
                    </div>
                    <SettingsToggle checked={notificationSettings.systemAlerts} onChange={(next) => { setNotificationSettings({ ...notificationSettings, systemAlerts: next }); setHasChanges(true); }} />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <div className={SETTING_TITLE}>Email Notifications</div>
                      <div className={SETTING_DESC}>Send notification summaries to your email.</div>
                    </div>
                    <SettingsToggle checked={notificationSettings.emailNotifications} onChange={(next) => { setNotificationSettings({ ...notificationSettings, emailNotifications: next }); setHasChanges(true); }} />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <div className={SETTING_TITLE}>Sound Enabled</div>
                      <div className={SETTING_DESC}>Play sound for notifications.</div>
                    </div>
                    <SettingsToggle checked={notificationSettings.soundEnabled} onChange={(next) => { setNotificationSettings({ ...notificationSettings, soundEnabled: next }); setHasChanges(true); }} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'display' && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Display & Appearance</h2>
                <p className="text-muted-foreground text-sm mb-6">Customize the look and feel of the application.</p>
                <div className="space-y-6">
                  <div>
                    <label className={FIELD_LABEL}>Theme</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'light', label: 'Ceramic' },
                        { id: 'dark', label: 'Tungsten' },
                        { id: 'system', label: 'System' },
                      ].map((opt) => (
                        <button key={opt.id} onClick={() => { setTheme(opt.id); setHasChanges(true); }} className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-sm transition-colors ${theme === opt.id ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Unit System</label>
                    <div className="flex gap-2">
                      {['imperial', 'metric'].map((unit) => (
                        <button key={unit} onClick={() => { setDisplaySettings({ ...displaySettings, unitSystem: unit }); setHasChanges(true); }} className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-sm transition-colors ${displaySettings.unitSystem === unit ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'}`}>
                          {unit === 'imperial' ? 'Imperial (ft, kt)' : 'Metric (m, km/h)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={SETTING_TITLE}>Compact Mode</div>
                        <div className={SETTING_DESC}>Reduce spacing and padding throughout the interface.</div>
                      </div>
                      <SettingsToggle checked={displaySettings.compactMode} onChange={(next) => { setDisplaySettings({ ...displaySettings, compactMode: next }); setHasChanges(true); }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={SETTING_TITLE}>Show Badges</div>
                        <div className={SETTING_DESC}>Display notification badges on navigation items.</div>
                      </div>
                      <SettingsToggle checked={displaySettings.showBadges} onChange={(next) => { setDisplaySettings({ ...displaySettings, showBadges: next }); setHasChanges(true); }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={SETTING_TITLE}>Sidebar Expanded by Default</div>
                        <div className={SETTING_DESC}>Keep the sidebar expanded on page load.</div>
                      </div>
                      <SettingsToggle checked={displaySettings.sidebarExpanded} onChange={(next) => { setDisplaySettings({ ...displaySettings, sidebarExpanded: next }); setHasChanges(true); }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Data Management</h2>
                <p className="text-muted-foreground text-sm mb-6">Control how your data is stored and managed.</p>
                <div className="space-y-6">
                  <div className="space-y-4 divide-y divide-border">
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                      <div>
                        <div className={SETTING_TITLE}>Auto-Save</div>
                        <div className={SETTING_DESC}>Automatically save changes as you work.</div>
                      </div>
                      <SettingsToggle checked={dataSettings.autoSave} onChange={(next) => { setDataSettings({ ...dataSettings, autoSave: next }); setHasChanges(true); }} />
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <div className={SETTING_TITLE}>Cache Enabled</div>
                        <div className={SETTING_DESC}>Store data locally for faster access.</div>
                      </div>
                      <SettingsToggle checked={dataSettings.cacheEnabled} onChange={(next) => { setDataSettings({ ...dataSettings, cacheEnabled: next }); setHasChanges(true); }} />
                    </div>
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Data Retention Period</label>
                    <div className="groove-input">
                      <select value={dataSettings.dataRetention} onChange={(e) => { setDataSettings({ ...dataSettings, dataRetention: e.target.value }); setHasChanges(true); }} className={SELECT_BASE}>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="365">1 year</option>
                        <option value="-1">Forever</option>
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">How long to keep historical data before automatic cleanup.</p>
                  </div>
                  <div className="pt-6 border-t border-border space-y-3">
                    <button className={ACTION_BUTTON}>Export All Data</button>
                    <button className={ACTION_BUTTON}>Clear Cache</button>
                    <button className={DANGER_BUTTON}>Delete All Data</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Security & Privacy</h2>
                <p className="text-muted-foreground text-sm mb-6">Manage your account security and active sessions.</p>
                <div className="space-y-6">
                  <button className={`${ACTION_BUTTON} text-left`}>Change Password</button>
                  <div>
                    <button className={`${ACTION_BUTTON} text-left`}>Two-Factor Authentication</button>
                    <p className="text-xs text-muted-foreground mt-2 px-1">Not enabled · Recommended for enhanced security.</p>
                  </div>
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Active Sessions</h3>
                    <div className="p-4 border border-border rounded-sm bg-background">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={SETTING_TITLE}>Current Session</div>
                          <div className={SETTING_DESC}>Chrome on macOS · San Francisco, CA</div>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500">Active</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border">
                    <button className={DANGER_BUTTON}>Sign Out All Devices</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'system' && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">System Information</h2>
                <p className="text-muted-foreground text-sm mb-6">View details about the application environment.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-sm bg-background">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Version</div>
                      <div className="text-sm font-mono text-foreground">1.5.0</div>
                    </div>
                    <div className="p-4 border border-border rounded-sm bg-background">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Build</div>
                      <div className="text-sm font-mono text-foreground">20251115</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border space-y-3">
                    <button className={ACTION_BUTTON}>Check for Updates</button>
                    <button className={ACTION_BUTTON}>View Documentation</button>
                    <button className={ACTION_BUTTON}>Report an Issue</button>
                  </div>
                  <div className="pt-6 border-t border-border text-xs text-muted-foreground">
                    <p>© 2025 FlightOps. All rights reserved.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(hasChanges || saveMessage) && (
            <div className={`mt-6 bg-card border border-border rounded-sm px-4 py-3 flex items-center justify-between text-sm font-medium border-l-4 ${isError ? 'border-l-red-500' : isSuccess ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${isError ? 'bg-red-500' : isSuccess ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs font-mono uppercase tracking-widest">{saveMessage || 'Unsaved Changes'}</span>
              </div>
              {!saveMessage && (
                <div className="flex gap-3">
                  <button onClick={() => setHasChanges(false)} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-sm bg-accent hover:bg-accent/80 transition-colors">
                    Discard
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60">
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Changes</span>
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
  );
}
