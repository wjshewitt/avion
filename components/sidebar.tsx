'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gauge, Plane, Cloud, MapPin, MessageSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import CornerBracket from './corner-bracket';
import { useStore } from '@/store/index';

const navItems = [
 { href: '/', icon: Gauge, label: 'Dashboard', badge: null },
 { href: '/flights', icon: Plane, label: 'Flights', badge: 3 },
 { href: '/weather', icon: Cloud, label: 'Weather', badge: null },
 { href: '/airports', icon: MapPin, label: 'Airports', badge: null },
 { href: '/chat-enhanced', icon: MessageSquare, label: 'Chat', badge: 'new' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const { userProfile, isLoadingProfile } = useStore();

  // Load saved state
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-expanded');
    if (stored) setIsExpanded(stored === 'true');
  }, []);

  // Save state
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('sidebar-expanded', String(newState));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleExpanded();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const shouldExpand = isExpanded || hovering;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (isLoadingProfile || !userProfile) return 'U';

    const name = userProfile.display_name || userProfile.username || 'User';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getDisplayName = () => {
    if (isLoadingProfile) return 'Loading...';
    if (!userProfile) return 'Guest User';
    return userProfile.display_name || userProfile.username || 'User';
  };

  // Get user email (placeholder since email isn't in the profile type)
  const getUserEmail = () => {
    if (isLoadingProfile) return 'Loading...';
    if (!userProfile) return 'guest@flightops.io';
    // Note: We'll need to add email to the profile or get it from auth
    return 'user@flightops.io'; // Placeholder for now
  };

  return (
    <aside
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`
        bg-card border-r border-border
        flex flex-col py-6 relative overflow-hidden
        transition-all duration-300 ease-in-out
        ${shouldExpand ? 'w-60' : 'w-16'}
      `}
    >
      {/* Logo */}
      <div className="mb-8 px-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue flex items-center justify-center flex-shrink-0">
            <span className="text-blue font-bold text-lg">F</span>
          </div>
          <div
            className={`
              overflow-hidden transition-all duration-300
              ${shouldExpand ? 'w-32 opacity-100' : 'w-0 opacity-0'}
            `}
          >
            <div className="font-semibold text-text-primary whitespace-nowrap">
              FlightOps
            </div>
            <div className="flex items-center gap-1 text-xs text-green">
              <div className="w-1.5 h-1.5 bg-green" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 relative z-10">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isFirst = index === 0;
          const isLast = index === navItems.length - 1;
          
          // Build corner hiding classes for stacked elements
          let cornerClass = '';
          if (!isFirst) cornerClass += ' corner-brackets-hide-top';
          if (!isLast) cornerClass += ' corner-brackets-hide-bottom';

          const renderBadge = () =>
            item.badge && (
              <span
                className={`
                  absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                  flex items-center justify-center
                  text-[10px] font-semibold
                  ${typeof item.badge === 'number'
                    ? 'bg-red text-text-inverse'
                    : 'bg-amber text-text-inverse'}
                `}
              >
                {typeof item.badge === 'number' ? item.badge : '!'}
              </span>
            );

          return (
            <div key={item.href} className="relative">
              {shouldExpand ? (
                // Expanded: active item wrapped in subtle corner brackets; inactives have faint bracket accents
                <CornerBracket
                  size="sm"
                  variant={isActive ? 'active' : 'default'}
                  className={`
                    transition-all duration-200
                    ${isActive ? 'corner-brackets-soft' : 'corner-brackets-subtle'}
                    ${cornerClass}
                  `}
                >
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center gap-3 px-3 py-3
                      transition-colors duration-150 border-l-2
                    ${isActive
                        ? 'bg-blue text-white border-blue'
                        : 'text-text-secondary hover:bg-accent hover:text-foreground border-transparent'}
                    `}
                  >
                    <div className="relative">
                      <Icon size={20} />
                      {renderBadge()}
                    </div>
                    <span className="font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                </CornerBracket>
              ) : (
                // Compressed: corner brackets are the primary framing for each icon tile
                <CornerBracket
                  size="sm"
                  variant={isActive ? 'active' : 'hover'}
                  className={`transition-all duration-200 ${cornerClass}`}
                >
                  <Link
                    href={item.href}
                    className={`
                      group relative flex items-center justify-center w-12 h-12
                      transition-colors duration-150
                    ${isActive
                        ? 'bg-blue text-white'
                        : 'text-text-secondary hover:bg-accent hover:text-foreground'}
                    `}
                    title={item.label}
                  >
                    <Icon size={20} />
                    {renderBadge()}
                  </Link>
                </CornerBracket>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 space-y-2 relative z-10">
        {/* User Profile */}
        {shouldExpand && (
          <div className="px-3 py-2 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-blue flex items-center justify-center text-blue text-sm font-semibold flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-text-primary whitespace-nowrap">
                  {getDisplayName()}
                </div>
                <div className="text-xs text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">
                  {getUserEmail()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={toggleExpanded}
          className={`
            w-full flex items-center gap-3 px-3 py-3
            text-text-secondary hover:bg-accent hover:text-foreground
            transition-colors duration-150
            ${shouldExpand ? 'justify-between' : 'justify-center'}
          `}
          title={isExpanded ? 'Collapse sidebar (⌘B)' : 'Expand sidebar (⌘B)'}
        >
          {shouldExpand ? (
            <>
              <span className="text-sm font-medium">Collapse</span>
              <ChevronLeft size={18} />
            </>
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          className={`
            flex items-center gap-3 px-3 py-3
            text-text-secondary hover:bg-accent hover:text-foreground
            transition-colors duration-150
            ${shouldExpand ? '' : 'justify-center'}
          `}
          title="Settings"
        >
          <Settings size={20} />
          {shouldExpand && <span className="font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
