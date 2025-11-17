"use client";

/**
 * @param {'success' | 'warning' | 'danger' | 'offline'} variant
 */
export const StatusLED = ({ variant = 'offline' }) => {
  const colors = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-[#F04E30]',
    offline: 'text-[#333]',
  };
  const shouldPulse = variant === 'warning';

  return (
    <div
      className={`
        w-3 h-3 rounded-full transition-all
        ${colors[variant]}
        ${shouldPulse ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: 'currentColor',
        boxShadow: variant !== 'offline' ? '0 0 8px currentColor' : 'none',
      }}
    />
  );
};
