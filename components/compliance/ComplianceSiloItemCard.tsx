import type { ComplianceSiloItem } from '@/types/compliance';

export function ComplianceSiloItemCard({ item }: { item: ComplianceSiloItem }) {
  
  const renderContent = () => {
    if (item.type === 'list' && Array.isArray(item.content)) {
      return (
        <ul className="space-y-2 mt-2">
          {item.content.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-[#2563EB] mt-1.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (item.type === 'kv' && item.data) {
      return (
         <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(item.data).map(([key, value]) => (
              <div key={key}>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{key}</div>
                <div className="font-medium text-foreground mt-1">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </div>
              </div>
            ))}
        </div>
      )
    }

    return <p className="mt-2 text-muted-foreground">{item.content}</p>;
  }

  return (
    <div className="bg-muted/30 border border-border rounded-sm p-4">
      <h4 className="font-semibold text-foreground">{item.title}</h4>
      {renderContent()}
    </div>
  );
}
