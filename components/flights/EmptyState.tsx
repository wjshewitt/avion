import Link from 'next/link';

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-12 text-center">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
        {hasFilters ? 'NO MATCHES' : 'NO FLIGHTS'}
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
        {hasFilters
          ? 'No flights match your current search criteria.'
          : "You haven't created any flights yet."}
      </p>
      {!hasFilters && (
        <Link href="/flights/create">
          <button className="bg-[#F04E30] text-white px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-[#F04E30]/90 transition-colors">
            CREATE FIRST FLIGHT
          </button>
        </Link>
      )}
    </div>
  );
}
