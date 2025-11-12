'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Upload, FileText, Check, X } from 'lucide-react';

interface FileUploadProps {
 onUpload: (file: File) => Promise<void>;
 acceptedTypes?: string[];
 maxSize?: number;
}

export default function FileUpload({ 
 onUpload,
 acceptedTypes = ['.json', '.xml', '.pdf'],
 maxSize = 5 * 1024 * 1024 // 5MB
}: FileUploadProps) {
 const [isDragging, setIsDragging] = useState(false);
 const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
 const [progress, setProgress] = useState(0);
 const [fileName, setFileName] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(true);
 };

 const handleDragLeave = () => {
 setIsDragging(false);
 };

 const validateFile = (file: File): string | null => {
 if (file.size > maxSize) {
 return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
 }
 const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
 if (!acceptedTypes.includes(fileExt)) {
 return `Only ${acceptedTypes.join(', ')} files are accepted`;
 }
 return null;
 };

 const processFile = async (file: File) => {
 const error = validateFile(file);
 if (error) {
 setErrorMessage(error);
 setUploadState('error');
 setTimeout(() => {
 setUploadState('idle');
 setErrorMessage('');
 }, 3000);
 return;
 }

 setFileName(file.name);
 setUploadState('uploading');
 setProgress(0);

 // Simulate upload progress
 const interval = setInterval(() => {
 setProgress(prev => {
 if (prev >= 90) {
 clearInterval(interval);
 return prev;
 }
 return prev + 10;
 });
 }, 200);

 try {
 await onUpload(file);
 clearInterval(interval);
 setProgress(100);
 setUploadState('success');
 setTimeout(() => {
 setUploadState('idle');
 setFileName('');
 setProgress(0);
 }, 2000);
 } catch (error) {
 clearInterval(interval);
 setUploadState('error');
 setErrorMessage('Upload failed. Please try again.');
 setTimeout(() => {
 setUploadState('idle');
 setFileName('');
 setProgress(0);
 }, 3000);
 }
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 
 const file = e.dataTransfer.files[0];
 if (file) {
 processFile(file);
 }
 };

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 processFile(file);
 }
 };

 return (
 <div className="w-full">
 <motion.div
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
 className={`
 relative border-2 border-dashed p-8
 transition-all duration-300 cursor-pointer
 ${isDragging ? 'border-blue bg-blue-50 scale-105' : 'border-border dark:border-slate-700 hover:border-blue'}
 ${uploadState === 'uploading' ? 'cursor-wait' : ''}
 ${uploadState === 'success' ? 'border-green bg-green-50' : ''}
 ${uploadState === 'error' ? 'border-red bg-red-50' : ''}
 `}
 whileHover={uploadState === 'idle' ? { scale: 1.02 } : {}}
 >
 <input
 ref={fileInputRef}
 type="file"
 accept={acceptedTypes.join(',')}
 onChange={handleFileSelect}
 className="hidden"
 />

 <div className="flex flex-col items-center justify-center gap-4">
 {uploadState === 'idle' && (
 <>
 <motion.div
 animate={{ y: [0, -10, 0] }}
 transition={{ duration: 2, repeat: Infinity }}
 className="text-blue"
 >
 <Upload size={48} />
 </motion.div>
 <div className="text-center">
 <p className="text-sm font-semibold text-text-primary dark:text-slate-50 mb-1">
 Drag and drop your file here
 </p>
 <p className="text-xs text-text-secondary dark:text-slate-400">
 or click to browse
 </p>
 <p className="text-xs text-text-secondary dark:text-slate-400 mt-2">
 {acceptedTypes.join(', ')} up to {(maxSize / 1024 / 1024).toFixed(0)}MB
 </p>
 </div>
 </>
 )}

 {uploadState === 'uploading' && (
 <>
 <FileText size={48} className="text-blue" />
 <div className="w-full max-w-xs">
 <p className="text-sm font-semibold text-text-primary dark:text-slate-50 mb-2 text-center">
 {fileName}
 </p>
 <div className="h-2 bg-surface dark:bg-slate-800 overflow-hidden">
 <motion.div
 className="h-full bg-blue"
 initial={{ width: 0 }}
 animate={{ width: `${progress}%` }}
 transition={{ duration: 0.3 }}
 />
 </div>
 <p className="text-xs text-text-secondary dark:text-slate-400 text-center mt-2">
 {progress}% uploaded
 </p>
 </div>
 </>
 )}

 {uploadState === 'success' && (
 <>
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: 'spring', stiffness: 200, damping: 10 }}
 className="text-green"
 >
 <Check size={48} />
 </motion.div>
 <p className="text-sm font-semibold text-green">
 Upload successful!
 </p>
 </>
 )}

 {uploadState === 'error' && (
 <>
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: 'spring', stiffness: 200, damping: 10 }}
 className="text-red"
 >
 <X size={48} />
 </motion.div>
 <p className="text-sm font-semibold text-red text-center">
 {errorMessage}
 </p>
 </>
 )}
 </div>
 </motion.div>
 </div>
 );
}
