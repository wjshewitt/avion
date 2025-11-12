'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column {
 key: string;
 label: string;
 sortable?: boolean;
}

interface DataTableProps {
 columns: Column[];
 data: any[];
 onRowClick?: (row: any) => void;
}

export default function DataTable({ columns, data, onRowClick }: DataTableProps) {
 const [sortKey, setSortKey] = useState<string | null>(null);
 const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

 const handleSort = (key: string) => {
 if (sortKey === key) {
 setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
 } else {
 setSortKey(key);
 setSortOrder('asc');
 }
 };

 const sortedData = sortKey
 ? [...data].sort((a, b) => {
 const aVal = a[sortKey];
 const bVal = b[sortKey];
 const order = sortOrder === 'asc' ? 1 : -1;
 return aVal > bVal ? order : aVal < bVal ? -order : 0;
 })
 : data;

 return (
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 overflow-hidden">
 <table className="w-full">
 <thead className="bg-surface dark:bg-slate-800 border-b border-border dark:border-slate-700">
 <tr>
 {columns.map((column) => (
 <th
 key={column.key}
 className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase"
 >
 {column.sortable ? (
 <button
 onClick={() => handleSort(column.key)}
 className="flex items-center gap-2 hover:text-text-primary dark:text-slate-50 transition-colors"
 >
 <span>{column.label}</span>
 {sortKey === column.key && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 >
 {sortOrder === 'asc' ? (
 <ChevronUp size={14} />
 ) : (
 <ChevronDown size={14} />
 )}
 </motion.div>
 )}
 </button>
 ) : (
 column.label
 )}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {sortedData.map((row, index) => (
 <motion.tr
 key={index}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 onClick={() => onRowClick?.(row)}
 className="hover:bg-surface dark:bg-slate-800 transition-colors cursor-pointer"
 >
 {columns.map((column) => (
 <td key={column.key} className="px-6 py-4 text-sm">
 {row[column.key]}
 </td>
 ))}
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}
