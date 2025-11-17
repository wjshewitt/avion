'use client';

import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { useProfile } from '@/hooks/useProfile';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const getUserInitials = () => {
    if (isLoading || !profile || !profile.display_name) {
      return '...';
    }
    
    const names = profile.display_name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (isLoading) return 'Loading...';
    if (!profile || !profile.display_name) return 'User';
    return profile.display_name;
  };

  const getUserEmail = () => {
    if (isLoading) return '';
    if (!profile || !profile.username) return '';
    return profile.username;
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-muted/40 border border-border rounded-sm hover:bg-muted transition-colors shadow-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User size={14} className="text-muted-foreground" />
        <span className="truncate max-w-[7rem]">{getUserDisplayName()}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 z-50 rounded-sm border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,0.18)] overflow-hidden"
          role="menu"
        >
          {/* Identity block */}
          <div className="px-3 py-2.5 flex items-center gap-3 bg-muted/40">
            <div className="w-7 h-7 rounded-sm border border-border flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
              {getUserInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground truncate">{getUserDisplayName()}</div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">{getUserEmail()}</div>
            </div>
          </div>

          <div className="border-t border-border/80 py-1 bg-card">
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
              role="menuitem"
            >
              <Settings size={14} className="text-muted-foreground" />
              Settings
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red hover:bg-red/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
            >
              <LogOut size={14} />
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>

          <div className="border-t border-border/80 px-3 py-1.5 bg-card">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
              <span>Profile</span>
              <span>⌘, Settings</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
