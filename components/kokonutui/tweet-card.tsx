'use client';

import { motion } from 'framer-motion';
import { Heart, Repeat2, MessageCircle, Share } from 'lucide-react';

interface TweetCardProps {
 author: string;
 handle: string;
 avatar?: string;
 content: string;
 timestamp: string;
 likes?: number;
 retweets?: number;
}

export default function TweetCard({
 author,
 handle,
 avatar,
 content,
 timestamp,
 likes = 0,
 retweets = 0,
}: TweetCardProps) {
 return (
 <motion.div
 className="relative bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6 overflow-hidden group cursor-pointer"
 whileHover={{ scale: 1.02 }}
 transition={{ duration: 0.2 }}
 >
 {/* Gradient overlay on hover */}
 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
 </div>

 <div className="relative z-10">
 {/* Header */}
 <div className="flex items-center gap-3 mb-4">
 {avatar ? (
 <img src={avatar} alt={author} className="w-12 h-12" />
 ) : (
 <div className="w-12 h-12 bg-blue flex items-center justify-center text-white font-bold">
 {author.charAt(0)}
 </div>
 )}
 <div>
 <p className="font-bold text-text-primary dark:text-slate-50">{author}</p>
 <p className="text-sm text-text-secondary dark:text-slate-400">@{handle}</p>
 </div>
 <span className="ml-auto text-xs text-text-secondary dark:text-slate-400">{timestamp}</span>
 </div>

 {/* Content */}
 <p className="text-text-primary dark:text-slate-50 mb-4 leading-relaxed">{content}</p>

 {/* Actions */}
 <div className="flex items-center gap-6 text-text-secondary dark:text-slate-400">
 <motion.button
 className="flex items-center gap-2 hover:text-blue transition-colors"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 >
 <MessageCircle size={18} />
 <span className="text-sm">Reply</span>
 </motion.button>

 <motion.button
 className="flex items-center gap-2 hover:text-green transition-colors"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 >
 <Repeat2 size={18} />
 <span className="text-sm">{retweets}</span>
 </motion.button>

 <motion.button
 className="flex items-center gap-2 hover:text-red transition-colors"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 >
 <Heart size={18} />
 <span className="text-sm">{likes}</span>
 </motion.button>

 <motion.button
 className="flex items-center gap-2 hover:text-blue transition-colors ml-auto"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 >
 <Share size={18} />
 </motion.button>
 </div>
 </div>
 </motion.div>
 );
}
