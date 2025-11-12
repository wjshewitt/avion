"use client";

import { Label } from "@/components/ui/label";
import { Plane, Users, Shield, Radio } from "lucide-react";

interface PreferencesStepProps {
  role: 'pilot' | 'crew' | 'admin' | 'dispatcher';
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  onRoleChange: (role: 'pilot' | 'crew' | 'admin' | 'dispatcher') => void;
  onTimezoneChange: (timezone: string) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

const roles = [
  { value: 'pilot', label: 'Pilot', icon: Plane, description: 'Flight crew member' },
  { value: 'crew', label: 'Crew', icon: Users, description: 'Cabin crew member' },
  { value: 'dispatcher', label: 'Dispatcher', icon: Radio, description: 'Flight operations' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Administrator' },
] as const;

const commonTimezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

const themes = [
  { value: 'light', label: 'Light', description: 'Light mode' },
  { value: 'system', label: 'System', description: 'Follow system' },
  { value: 'dark', label: 'Dark', description: 'Dark mode' },
] as const;

export function PreferencesStep({
  role,
  timezone,
  theme,
  onRoleChange,
  onTimezoneChange,
  onThemeChange,
}: PreferencesStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium text-text-primary tracking-tight">Set your preferences</h2>
        <p className="text-sm text-text-muted">Customize your experience — you can change these later</p>
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <Label className="text-text-primary font-medium uppercase text-xs tracking-wider">Role</Label>
        <div className="grid grid-cols-2 gap-4">
          {roles.map((roleOption) => {
            const Icon = roleOption.icon;
            return (
              <button
                key={roleOption.value}
                type="button"
                onClick={() => onRoleChange(roleOption.value)}
                className={`p-4 border-2 transition-all text-left ${
                  role === roleOption.value
                    ? "border-primary bg-primary/5"
                    : "border-border-subtle hover:border-primary/30"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 border ${
                    role === roleOption.value ? "bg-primary text-white border-primary" : "bg-background-secondary text-text-muted border-border-subtle"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary text-sm">{roleOption.label}</p>
                    <p className="text-xs text-text-muted mt-1 font-medium">{roleOption.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timezone Selection */}
      <div className="space-y-4">
        <Label htmlFor="timezone" className="text-text-primary font-medium uppercase text-xs tracking-wider">
          Timezone
        </Label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="w-full px-4 py-3 border border-border-subtle bg-background-secondary text-text-primary focus:border-primary focus:outline-none font-medium text-sm"
        >
          {commonTimezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <Label className="text-text-primary font-medium uppercase text-xs tracking-wider">Theme</Label>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              type="button"
              onClick={() => onThemeChange(themeOption.value)}
              className={`p-4 border-2 transition-all ${
                theme === themeOption.value
                  ? "border-primary bg-primary/5"
                  : "border-border-subtle hover:border-primary/30"
              }`}
            >
              <div className="text-center">
                <p className="font-medium text-text-primary text-sm">{themeOption.label}</p>
                <p className="text-xs text-text-muted mt-2 font-medium">{themeOption.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
