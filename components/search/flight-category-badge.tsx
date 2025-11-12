interface FlightCategoryBadgeProps {
  category?: string;
}

export function FlightCategoryBadge({ category }: FlightCategoryBadgeProps) {
  if (!category) return null;

  const colors: Record<string, string> = {
    VFR: 'bg-green/10 text-green border-green/20',
    MVFR: 'bg-blue/10 text-blue border-blue/20',
    IFR: 'bg-amber/10 text-amber border-amber/20',
    LIFR: 'bg-red/10 text-red border-red/20',
  };

  return (
    <span
      className={`
        inline-block px-2 py-0.5 
        text-[11px] uppercase font-semibold tracking-wide
        border
        ${colors[category] || 'bg-background-secondary text-text-secondary border-border'}
      `}
    >
      {category}
    </span>
  );
}
