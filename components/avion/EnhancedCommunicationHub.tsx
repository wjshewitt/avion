"use client";

import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Phone,
  Video,
  Users,
  MapPin,
  Clock,
  Check,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  Search,
  Filter,
  Pin,
  Star,
  Archive,
  Reply,
  Forward,
  MoreVertical,
  Mic,
  MicOff,
  Camera,
  Image,
  File,
  UserPlus,
  Settings,
  Bell,
  BellOff,
  Hash,
  Lock,
  Globe,
  Wifi,
  Battery,
  Signal,
  Terminal,
  Activity,
  Zap,
  Shield,
  Cloud,
  Download,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    online: boolean;
    status?: 'available' | 'busy' | 'away';
  };
  channel: {
    id: string;
    name: string;
    type: 'direct' | 'group' | 'department' | 'flight' | 'emergency';
  };
  content: string;
  timestamp: Date;
  edited?: Date;
  attachments?: Array<{
    id: string;
    type: 'document' | 'image' | 'weather' | 'flight-plan' | 'audio' | 'video';
    name: string;
    url: string;
    size?: number;
    preview?: string;
  }>;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
    hasReacted: boolean;
  }>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isPinned?: boolean;
  thread?: {
    id: string;
    count: number;
    messages: Message[];
  };
  mentions?: string[];
}

interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'department' | 'flight' | 'emergency';
  members?: number;
  unread?: number;
  lastMessage?: string;
  lastActivity?: Date;
  isActive?: boolean;
  priority?: boolean;
  isMuted?: boolean;
  isPrivate?: boolean;
  description?: string;
  tags?: string[];
}

interface EnhancedCommunicationHubProps {
  channels: Channel[];
  messages: Message[];
  currentUserId: string;
  className?: string;
}

export default function EnhancedCommunicationHub({
  channels,
  messages,
  currentUserId,
  className
}: EnhancedCommunicationHubProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>(channels[0]?.id);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannel]);

  const filteredMessages = messages.filter(m =>
    m.channel.id === selectedChannel &&
    (searchQuery === '' ||
     m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.sender.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getChannelIcon = (type: string) => {
    const icons = {
      direct: Users,
      group: MessageSquare,
      department: Shield,
      flight: MapPin,
      emergency: AlertCircle
    };
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'border-red-500 bg-red-500/5',
      high: 'border-amber-500 bg-amber-500/5',
      normal: 'border-[#333] bg-[#1A1A1A]',
      low: 'border-[#444] bg-[#1A1A1A]'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      sending: <Clock className="w-3 h-3 text-[#71717A]" />,
      sent: <Check className="w-3 h-3 text-[#71717A]" />,
      delivered: <CheckCheck className="w-3 h-3 text-[#A1A1AA]" />,
      read: <CheckCheck className="w-3 h-3 text-blue-500" />
    };
    return icons[status as keyof typeof icons];
  };

  const handleSendMessage = useCallback(() => {
    if (messageInput.trim()) {
      setMessageInput('');
      setReplyingTo(null);
      setEditingMessage(null);
      setIsTyping(false);
    }
  }, [messageInput]);

  const handleStartRecording = () => {
    setIsRecording(true);
    recordingTimerRef.current = setTimeout(() => {
      setIsRecording(false);
    }, 60000); // Max 60 seconds
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
    }
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const typingUsers = ['Capt. Stevens', 'ATC']; // Mock typing users

  return (
    <div className={cn("h-full flex bg-[#0F0F0F] rounded-xl border border-[#333] overflow-hidden", className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, #F04E30 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, #2563EB 0%, transparent 50%)`
        }} />
      </div>

      {/* Sidebar */}
      <div className="relative w-80 border-r border-[#333] flex flex-col bg-[#1A1A1A]">
        {/* Header */}
        <div className="p-4 border-b border-[#333] bg-[#222]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-mono text-lg flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#F04E30]" />
              <span>Communications</span>
            </h3>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setOnlineStatus(!onlineStatus)}
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  onlineStatus ? "bg-emerald-500" : "bg-gray-500"
                )}>
                  {onlineStatus && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-4 h-4 text-[#71717A]" />
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels or messages..."
              className="w-full pl-10 pr-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-white placeholder-[#71717A] text-sm font-mono focus:outline-none focus:border-[#F04E30] transition-all"
            />
          </div>
        </div>

        {/* Channel Tags Filter */}
        <div className="px-4 py-2 border-b border-[#333]">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {['all', 'operations', 'weather', 'emergency'].map((tag) => (
              <motion.button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={cn(
                  "flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all",
                  filterTag === tag
                    ? "bg-[#F04E30] text-black"
                    : "bg-[#2A2A2A] text-[#71717A] hover:text-white"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Hash className="w-3 h-3" />
                <span>{tag}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <AnimatePresence>
            {channels.map((channel) => {
              const ChannelIcon = getChannelIcon(channel.type);
              const isActive = selectedChannel === channel.id;
              const unreadCount = messages.filter(m =>
                m.channel.id === channel.id &&
                m.sender.id !== currentUserId &&
                m.status !== 'read'
              ).length;

              return (
                <motion.div
                  key={channel.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <motion.button
                    onClick={() => setSelectedChannel(channel.id)}
                    className={cn(
                      "w-full p-3 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group",
                      isActive
                        ? "bg-[#2A2A2A] border-[#F04E30] shadow-lg"
                        : "bg-[#1A1A1A] border-[#333] hover:border-[#444]"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Glow Effect */}
                    {channel.priority && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#F04E30]/5 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}

                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className={cn(
                          "p-2 rounded-lg border transition-all",
                          channel.priority ? "bg-[#F04E30]/10 border-[#F04E30]/30" : "bg-[#333]/50 border-[#444]",
                          isActive && "border-current"
                        )}>
                          <ChannelIcon className={cn(
                            "w-4 h-4",
                            channel.priority ? "text-[#F04E30]" : isActive ? "text-[#F04E30]" : "text-[#71717A]"
                          )} />
                        </div>
                        {/* Online Indicator */}
                        {channel.type === 'direct' && (
                          <motion.div
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1A1A1A]"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-mono text-sm truncate flex items-center space-x-1">
                            {channel.isPrivate && <Lock className="w-3 h-3 text-[#71717A]" />}
                            <span>{channel.name}</span>
                          </h4>
                          <div className="flex items-center space-x-2">
                            {channel.isMuted && <BellOff className="w-3 h-3 text-[#71717A]" />}
                            {channel.lastActivity && (
                              <span className="text-[10px] font-mono text-[#71717A]">
                                {Math.floor((new Date().getTime() - channel.lastActivity.getTime()) / 60000)}m
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider mb-1">
                          {channel.type}
                          {channel.members && ` • ${channel.members}`}
                        </p>
                        {channel.lastMessage && (
                          <p className="text-xs text-[#A1A1AA] truncate">
                            {channel.lastMessage}
                          </p>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <motion.div
                          className="px-2 py-1 bg-[#F04E30] rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <span className="text-xs font-mono text-black">
                            {unreadCount}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-[#333] bg-[#222]">
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg hover:border-[#444] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-4 h-4 text-[#71717A]" />
              <span className="text-xs font-mono text-[#71717A]">Call</span>
            </motion.button>
            <motion.button
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg hover:border-[#444] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Video className="w-4 h-4 text-[#71717A]" />
              <span className="text-xs font-mono text-[#71717A]">Video</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col">
        {/* Chat Header */}
        <motion.div
          className="p-4 border-b border-[#333] bg-[#222] flex items-center justify-between backdrop-blur-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3">
            {currentChannel && (
              <>
                {(() => {
                  const ChannelIcon = getChannelIcon(currentChannel.type);
                  return (
                    <motion.div
                      className={cn(
                        "p-2 rounded-lg border",
                        currentChannel.priority ? "bg-[#F04E30]/10 border-[#F04E30]/30" : "bg-[#333]/50 border-[#444]"
                      )}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChannelIcon className={cn(
                        "w-5 h-5",
                        currentChannel.priority ? "text-[#F04E30]" : "text-[#71717A]"
                      )} />
                    </motion.div>
                  );
                })()}
                <div>
                  <h3 className="text-white font-mono text-base flex items-center space-x-2">
                    <span>{currentChannel?.name}</span>
                    {currentChannel?.priority && (
                      <motion.div
                        className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-mono uppercase rounded"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Priority
                      </motion.div>
                    )}
                  </h3>
                  <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                    {currentChannel?.type}
                    {currentChannel?.members && ` • ${currentChannel.members} members`}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-[#71717A] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Users className="w-4 h-4" />
            </motion.button>
            <motion.button
              className="p-2 text-[#71717A] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Phone className="w-4 h-4" />
            </motion.button>
            <motion.button
              className="p-2 text-[#71717A] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Video className="w-4 h-4" />
            </motion.button>
            <motion.button
              className="p-2 text-[#71717A] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {filteredMessages.map((message) => {
              const isOwn = message.sender.id === currentUserId;

              return (
                <motion.div
                  key={message.id}
                  className={cn(
                    "flex",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <div className={cn(
                    "max-w-2xl",
                    isOwn && "flex flex-col items-end"
                  )}>
                    {!isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                          message.sender.online ? "border-emerald-500" : "border-[#444]",
                          "bg-[#2A2A2A]"
                        )}>
                          <span className="text-[10px] font-mono text-white">
                            {message.sender.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-white">
                            {message.sender.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#71717A]">
                            {message.sender.role}
                          </span>
                          {message.sender.status && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              message.sender.status === 'available' ? 'bg-emerald-500' :
                              message.sender.status === 'busy' ? 'bg-red-500' :
                              'bg-amber-500'
                            )} />
                          )}
                        </div>
                      </div>
                    )}

                    <motion.div
                      className={cn(
                        "relative p-4 rounded-xl border max-w-lg backdrop-blur-sm",
                        isOwn ? "bg-[#F04E30]/10 border-[#F04E30]/30" : getPriorityColor(message.priority)
                      )}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      {message.isPinned && (
                        <motion.div
                          className="absolute -top-2 -left-2"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                        >
                          <Pin className="w-3 h-3 text-[#F04E30]" />
                        </motion.div>
                      )}

                      {message.priority === 'urgent' && (
                        <motion.div
                          className="absolute inset-0 rounded-xl border border-red-500"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      <p className="text-sm text-white font-sans leading-relaxed">
                        {message.content}
                      </p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <motion.div
                              key={attachment.id}
                              className="flex items-center space-x-3 p-3 bg-[#1A1A1A] rounded-lg border border-[#333] cursor-pointer hover:border-[#444] transition-all"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {attachment.type === 'image' && <Image className="w-4 h-4 text-[#71717A]" />}
                              {attachment.type === 'document' && <File className="w-4 h-4 text-[#71717A]" />}
                              {attachment.type === 'audio' && <Mic className="w-4 h-4 text-[#71717A]" />}
                              {attachment.type === 'video' && <Video className="w-4 h-4 text-[#71717A]" />}
                              <div className="flex-1">
                                <p className="text-xs font-mono text-[#A1A1AA]">
                                  {attachment.name}
                                </p>
                                {attachment.size && (
                                  <p className="text-[10px] font-mono text-[#71717A]">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                              <Download className="w-3 h-3 text-[#71717A]" />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {message.reactions.map((reaction) => (
                            <motion.button
                              key={reaction.emoji}
                              className={cn(
                                "flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs",
                                reaction.hasReacted
                                  ? "bg-[#F04E30]/10 border-[#F04E30]/30"
                                  : "bg-[#2A2A2A] border-[#333] hover:border-[#444]"
                              )}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-[#71717A]">{reaction.count}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-[#71717A]">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.edited && (
                            <span className="text-[10px] font-mono text-[#71717A] italic">
                              edited
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {isOwn && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && typingUsers.length > 0 && (
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-[#71717A] rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-[#71717A]">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              className="px-4 py-2 border-t border-[#333] bg-[#222]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-mono text-[#71717A]">
                  <Reply className="w-3 h-3" />
                  <span>Replying to message</span>
                </div>
                <motion.button
                  onClick={() => setReplyingTo(null)}
                  className="text-[#71717A] hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 border-t border-[#333] bg-[#222]">
          {/* Recording Interface */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono text-red-500">Recording...</span>
                  </div>
                  <motion.button
                    onClick={handleStopRecording}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-mono"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Stop
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end space-x-2">
            <motion.button
              className="p-2 text-[#71717A] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                // Handle file upload
              }}
            />

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-white placeholder-[#71717A] text-sm font-mono focus:outline-none focus:border-[#F04E30] transition-all resize-none"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              {/* Attachment Preview */}
              <AnimatePresence>
                {showAttachments && (
                  <motion.div
                    className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-[#2A2A2A] border border-[#333] rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="grid grid-cols-4 gap-2">
                      <button className="flex flex-col items-center space-y-1 p-2 hover:bg-[#333] rounded-lg transition-colors">
                        <Image className="w-5 h-5 text-[#71717A]" />
                        <span className="text-xs font-mono text-[#71717A]">Image</span>
                      </button>
                      <button className="flex flex-col items-center space-y-1 p-2 hover:bg-[#333] rounded-lg transition-colors">
                        <File className="w-5 h-5 text-[#71717A]" />
                        <span className="text-xs font-mono text-[#71717A]">File</span>
                      </button>
                      <button className="flex flex-col items-center space-y-1 p-2 hover:bg-[#333] rounded-lg transition-colors">
                        <Camera className="w-5 h-5 text-[#71717A]" />
                        <span className="text-xs font-mono text-[#71717A]">Camera</span>
                      </button>
                      <button className="flex flex-col items-center space-y-1 p-2 hover:bg-[#333] rounded-lg transition-colors">
                        <Mic className="w-5 h-5 text-[#71717A]" />
                        <span className="text-xs font-mono text-[#71717A]">Audio</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={handleStartRecording}
              className={cn(
                "p-2 transition-colors",
                isRecording ? "text-red-500" : "text-[#71717A] hover:text-white"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>

            <motion.button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className={cn(
                "p-3 rounded-lg transition-all",
                messageInput.trim()
                  ? "bg-[#F04E30] text-black hover:bg-[#F04E30]/80 shadow-lg"
                  : "bg-[#333] text-[#71717A] cursor-not-allowed"
              )}
              whileHover={messageInput.trim() ? { scale: 1.05 } : {}}
              whileTap={messageInput.trim() ? { scale: 0.95 } : {}}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Info Sidebar */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="w-80 border-l border-[#333] bg-[#1A1A1A] p-4"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-mono">Channel Info</h4>
              <motion.button
                onClick={() => setShowInfo(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-[#71717A]" />
              </motion.button>
            </div>
            {/* Channel info content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add missing icons
const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);