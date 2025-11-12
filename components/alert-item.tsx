'use client';

import { Alert } from '@/lib/types';
import { AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import CornerBracket from './corner-bracket';
import { useState, useEffect } from 'react';

interface AlertItemProps {
 alert: Alert;
}

export default function AlertItem({ alert }: AlertItemProps) {
 const { dismissAlert } = useAppStore();
 const [formattedTime, setFormattedTime] = useState<string>('');

 useEffect(() => {
   setFormattedTime(alert.timestamp.toLocaleTimeString());
 }, [alert.timestamp]);

 return (
 <CornerBracket size="sm" variant={alert.severity === 'critical' ? 'critical' : 'default'}>
 <div
 className={`
 border-l-4 bg-white p-4 shadow-sm flex items-start gap-3
 ${alert.severity === 'critical' ? 'border-red' : 'border-amber'}
 `}
 >
 <div className={alert.severity === 'critical' ? 'text-red' : 'text-amber'}>
 <AlertTriangle size={18} />
 </div>
 
 <div className="flex-1">
 <p className="text-sm text-text-primary">{alert.message}</p>
 {formattedTime && (
 <p className="text-xs text-text-secondary mt-1">
 {formattedTime}
 </p>
 )}
 </div>

 <button
 onClick={() => dismissAlert(alert.id)}
 className="text-text-secondary hover:text-text-primary transition-colors"
 title="Dismiss"
 >
 <X size={16} />
 </button>
 </div>
 </CornerBracket>
 );
}
