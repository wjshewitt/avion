"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
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
  X,
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
  };
  channel: {
    id: string;
    name: string;
    type: 'direct' | 'group' | 'department' | 'flight';
  };
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'document' | 'image' | 'weather' | 'flight-plan';
    name: string;
    url: string;
  }>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  isPinned?: boolean;
  isEdited?: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'department' | 'flight';
  members?: number;
  unread?: number;
  lastMessage?: string;
  lastActivity?: Date;
  isActive?: boolean;
  priority?: boolean;
}

interface CommunicationHubProps {
  channels: Channel[];
  messages: Message[];
  currentUserId: string;
  className?: string;
}

export default function CommunicationHub({ channels, messages, currentUserId, className }: CommunicationHubProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>(channels[0]?.id);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    switch (type) {
      case 'direct': return Users;
      case 'group': return MessageSquare;
      case 'department': return AlertCircle;
      case 'flight': return MapPin;
      default: return MessageSquare;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-amber-500 bg-amber-500/10';
      case 'normal': return 'border-[#333] bg-[#1A1A1A]';
      case 'low': return 'border-[#444] bg-[#1A1A1A]';
      default: return 'border-[#333] bg-[#1A1A1A]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-[#71717A]" />;
      case 'sent': return <Check className="w-3 h-3 text-[#71717A]" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-[#A1A1AA]" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // This would typically send the message via your API
      setMessageInput('');
      setReplyingTo(null);
    }
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className={cn("h-full flex bg-[#1A1A1A] rounded-sm border border-[#333] overflow-hidden", className)}>
      {/* Sidebar */}
      <div className="w-80 border-r border-[#333] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333] bg-[#222]">
          <h3 className="text-white font-mono text-lg mb-3">Communications</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-sm text-white placeholder-[#71717A] text-sm font-mono focus:outline-none focus:border-[#F04E30] transition-colors"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((channel) => {
            const ChannelIcon = getChannelIcon(channel.type);
            const isActive = selectedChannel === channel.id;
            const unreadCount = messages.filter(m =>
              m.channel.id === channel.id &&
              m.sender.id !== currentUserId &&
              m.status !== 'read'
            ).length;

            return (
              <motion.button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={cn(
                  "w-full p-3 rounded-sm border transition-all duration-200 text-left",
                  isActive
                    ? "bg-[#2A2A2A] border-[#F04E30]"
                    : "bg-[#1A1A1A] border-[#333] hover:border-[#444]"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "p-2 rounded-xs border",
                    channel.priority ? "bg-[#F04E30]/10 border-[#F04E30]/30" : "bg-[#333]/50 border-[#444]",
                    isActive && "border-current"
                  )}>
                    <ChannelIcon className={cn(
                      "w-4 h-4",
                      channel.priority ? "text-[#F04E30]" : isActive ? "text-[#F04E30]" : "text-[#71717A]"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-mono text-sm truncate">
                        {channel.name}
                      </h4>
                      {channel.lastActivity && (
                        <span className="text-[10px] font-mono text-[#71717A]">
                          {Math.floor((new Date().getTime() - channel.lastActivity.getTime()) / 60000)}m
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-[#71717A] truncate uppercase tracking-wider">
                      {channel.type}
                    </p>
                    {channel.lastMessage && (
                      <p className="text-xs text-[#A1A1AA] truncate mt-1">
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
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-[#333] bg-[#222]">
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-sm hover:border-[#444] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-4 h-4 text-[#71717A]" />
              <span className="text-xs font-mono text-[#71717A]">Call</span>
            </motion.button>
            <motion.button
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-sm hover:border-[#444] transition-colors"
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
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-[#333] bg-[#222] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentChannel && (
              <>
                {(() => {
                  const ChannelIcon = getChannelIcon(currentChannel.type);
                  return (
                    <div className={cn(
                      "p-2 rounded-xs border",
                      currentChannel.priority ? "bg-[#F04E30]/10 border-[#F04E30]/30" : "bg-[#333]/50 border-[#444]"
                    )}>
                      <ChannelIcon className={cn(
                        "w-4 h-4",
                        currentChannel.priority ? "text-[#F04E30]" : "text-[#71717A]"
                      )} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-white font-mono text-base">
                    {currentChannel?.name}
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
        </div>

        {/* Messages */}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={cn(
                    "max-w-2xl",
                    isOwn && "flex flex-col items-end"
                  )}>
                    {!isOwn && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2",
                          message.sender.online ? "border-emerald-500" : "border-[#444]",
                          "bg-[#2A2A2A] flex items-center justify-center"
                        )}>
                          <span className="text-[8px] font-mono text-white">
                            {message.sender.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-mono text-white">
                            {message.sender.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#71717A] ml-2">
                            {message.sender.role}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={cn(
                      "relative p-3 rounded-sm border max-w-lg",
                      isOwn ? "bg-[#F04E30]/10 border-[#F04E30]/30" : getPriorityColor(message.priority)
                    )}>
                      {message.isPinned && (
                        <div className="absolute -top-2 -left-2">
                          <Pin className="w-3 h-3 text-[#F04E30]" />
                        </div>
                      )}

                      <p className="text-sm text-white font-sans leading-relaxed">
                        {message.content}
                      </p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-2 p-2 bg-[#1A1A1A] rounded-xs border border-[#333] cursor-pointer hover:border-[#444] transition-colors"
                            >
                              <Paperclip className="w-3 h-3 text-[#71717A]" />
                              <span className="text-xs font-mono text-[#A1A1AA]">
                                {attachment.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-mono text-[#71717A]">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center space-x-2">
                          {message.isEdited && (
                            <span className="text-[10px] font-mono text-[#71717A] italic">
                              edited
                            </span>
                          )}
                          {isOwn && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyingTo && (
          <motion.div
            className="px-4 py-2 border-t border-[#333] bg-[#222]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

        {/* Input */}
        <div className="p-4 border-t border-[#333] bg-[#222]">
          <div className="flex items-end space-x-2">
            <motion.button
              className="p-2 text-[#71717A] hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-sm text-white placeholder-[#71717A] text-sm font-mono focus:outline-none focus:border-[#F04E30] transition-colors resize-none"
                rows={1}
                style={{
                  minHeight: '40px',
                  maxHeight: '120px'
                }}
              />
            </div>

            <motion.button
              className={cn(
                "p-2 transition-colors",
                isRecording ? "text-red-500" : "text-[#71717A] hover:text-white"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>

            <motion.button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className={cn(
                "p-2 rounded-sm transition-colors",
                messageInput.trim()
                  ? "bg-[#F04E30] text-black hover:bg-[#F04E30]/80"
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
    </div>
  );
}