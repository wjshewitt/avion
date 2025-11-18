'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevents hydration mismatch
  }

  const updateThemePreference = async (newTheme: string) => {
    // Optimistic update handled by next-themes
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_preference: newTheme })
      });
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  const toggleTheme = () => {
    let newTheme = 'light';
    if (theme === 'light') {
      newTheme = 'dark';
    } else if (theme === 'dark') {
      newTheme = 'system';
    }
    
    setTheme(newTheme);
    updateThemePreference(newTheme);
  };

  const getIcon = () => {
    if (resolvedTheme === 'dark') return <Moon size={16} />;
    if (resolvedTheme === 'light') return <Sun size={16} />;
    return <Monitor size={16} />;
  };

  const getLabel = () => {
    if (resolvedTheme === 'dark') return 'Dark';
    if (resolvedTheme === 'light') return 'Light';  
    return 'System';
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors rounded-md"
      title={`Current theme: ${getLabel()}. Click to cycle.`}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
}

export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const updateThemePreference = async (newTheme: string) => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_preference: newTheme })
      });
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateThemePreference(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors rounded"
      title={`Toggle theme (currently ${resolvedTheme})`}
    >
      {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function ThemeToggleSimple() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const updateThemePreference = async (newTheme: string) => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_preference: newTheme })
      });
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  return (
    <button
      onClick={() => {
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        updateThemePreference(newTheme);
      }}
      className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors rounded"
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
