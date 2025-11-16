'use client';

import { useState } from 'react';
import { Check, Upload, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ComplianceDocument } from '@/types/compliance';

interface DocumentChecklistProps {
  documents: ComplianceDocument[];
  onUpload?: (documentId: string) => void;
}

export function DocumentChecklist({ documents, onUpload }: DocumentChecklistProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'current':
        return 'text-emerald-500';
      case 'expiring':
      case 'due_soon':
        return 'text-amber-500';
      case 'non-compliant':
      case 'overdue':
        return 'text-[#F04E30]';
      default:
        return 'text-zinc-400';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isComplete = (doc: ComplianceDocument) => {
    return doc.status === 'compliant' || doc.status === 'current';
  };

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const complete = isComplete(doc);
        const hovered = hoveredId === doc.id;

        return (
          <motion.div
            key={doc.id}
            onMouseEnter={() => setHoveredId(doc.id)}
            onMouseLeave={() => setHoveredId(null)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-sm hover:border-[#2563EB]/50 transition-colors"
          >
            {/* Checkbox/Status Indicator */}
            <div
              className={`
                flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                ${
                  complete
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'bg-background border-zinc-300 dark:border-zinc-700'
                }
              `}
            >
              {complete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check size={14} strokeWidth={3} className="text-white" />
                </motion.div>
              )}
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground truncate">
                  {doc.name}
                </span>
                <span className={`text-xs font-mono uppercase ${getStatusColor(doc.status)}`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="font-mono">{doc.type}</span>
                {doc.expiryDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} strokeWidth={1.5} />
                    {formatDate(doc.expiryDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Upload Button (appears on hover if incomplete) */}
            {!complete && hovered && onUpload && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onUpload(doc.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-[#2563EB]/90 transition-colors"
              >
                <Upload size={12} strokeWidth={2} />
                Upload
              </motion.button>
            )}
          </motion.div>
        );
      })}

      {documents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No documents available
        </div>
      )}
    </div>
  );
}
