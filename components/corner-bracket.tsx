'use client';

interface CornerBracketProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  // default: subtle neutral brackets
  // active: stronger accent for selected / primary
  // hover: interactive emphasis
  // critical/success: semantic states
  // soft/subtle: light treatments for low-emphasis framing (used in expanded sidebar rows)
  variant?:
    | 'default'
    | 'active'
    | 'hover'
    | 'critical'
    | 'success'
    | 'soft'
    | 'subtle';
  className?: string;
}

export default function CornerBracket({
  children,
  size = 'md',
  variant = 'default',
  className = '',
}: CornerBracketProps) {
  const sizeClass = `corner-brackets-${size}`;

  // Map semantic variants to utility classes so sidebar can opt into subtle/soft
  const variantClass = (() => {
    switch (variant) {
      case 'active':
        return 'corner-brackets-active';
      case 'hover':
        return 'corner-brackets-hover';
      case 'critical':
        return 'corner-brackets-critical';
      case 'success':
        return 'corner-brackets-success';
      case 'soft':
        return 'corner-brackets-soft';
      case 'subtle':
        return 'corner-brackets-subtle';
      case 'default':
      default:
        return 'corner-brackets-default';
    }
  })();

  return (
    <div className={`corner-brackets ${sizeClass} ${variantClass} ${className}`}>
      <div className="corner-brackets-inner h-full">{children}</div>
    </div>
  );
}

