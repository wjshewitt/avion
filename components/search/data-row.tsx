interface DataRowProps {
  label: string;
  value: string | number;
}

export function DataRow({ label, value }: DataRowProps) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] uppercase text-text-muted tracking-wide min-w-[60px]">
        {label}
      </span>
      <span className="text-[12px] font-mono text-text-primary">
        {value}
      </span>
    </div>
  );
}
