'use client';

import { ReactNode } from 'react';

type StatusType = 'EN_ROUTE' | 'ARRIVED' | 'DELAYED' | 'CANCELLED' | 'SCHEDULED' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

interface StatusBadgeProps {
 status: StatusType;
 children?: ReactNode;
}

const statusStyles: Record<StatusType, string> = {
 EN_ROUTE: 'bg-blue-100 text-blue-700 border-blue-200',
 ARRIVED: 'bg-green-100 text-green-700 border-green-200',
 DELAYED: 'bg-amber-100 text-amber-700 border-amber-200',
 CANCELLED: 'bg-red-100 text-red-700 border-red-200',
 SCHEDULED: 'bg-gray-100 text-gray-700 border-gray-200',
 LOW: 'bg-green-100 text-green-700 border-green-200',
 MODERATE: 'bg-amber-100 text-amber-700 border-amber-200',
 HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
 CRITICAL: 'bg-red-100 text-red-700 border-red-200',
};

export default function StatusBadge({ status, children }: StatusBadgeProps) {
 return (
 <span
 className={`
 inline-flex items-center gap-1.5
 px-3 py-1 
 text-xs font-semibold
 border
 ${statusStyles[status]}
 `}
 >
 {children || status.replace('_', ' ')}
 </span>
 );
}
