import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from './types';

export interface ChatContext {
 type: 'flight' | 'airport' | 'general';
 flightIds?: string[];
 airportCodes?: string[];
}

export interface Conversation {
 id: string;
 name: string;
 messages: Message[];
 context: ChatContext;
 createdAt: Date;
 updatedAt: Date;
 pinned: boolean;
}

interface ChatState {
 conversations: Conversation[];
 activeConversationId: string | null;
 selectedContext: ChatContext;
 isGenerating: boolean;
 
 // Conversation management
 createConversation: (name: string, context?: ChatContext) => string;
 deleteConversation: (id: string) => void;
 renameConversation: (id: string, name: string) => void;
 pinConversation: (id: string) => void;
 setActiveConversation: (id: string | null) => void;
 
 // Message management
 addMessage: (conversationId: string, message: Omit<Message, 'id'>) => void;
 updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
 deleteMessage: (conversationId: string, messageId: string) => void;
 
 // Generation state
 setIsGenerating: (isGenerating: boolean) => void;
 stopGeneration: () => void;
 
 // Context
 setContext: (context: ChatContext) => void;
 
 // Utilities
 getActiveConversation: () => Conversation | null;
}

export const useChatStore = create<ChatState>()(
 persist(
 (set, get) => ({
 conversations: [],
 activeConversationId: null,
 selectedContext: { type: 'general' },
 isGenerating: false,
 
 createConversation: (name, context) => {
 const id = `conv-${Date.now()}`;
 const newConversation: Conversation = {
 id,
 name,
 messages: [],
 context: context || get().selectedContext,
 createdAt: new Date(),
 updatedAt: new Date(),
 pinned: false,
 };
 
 set((state) => ({
 conversations: [newConversation, ...state.conversations],
 activeConversationId: id,
 }));
 
 return id;
 },
 
 deleteConversation: (id) => {
 set((state) => ({
 conversations: state.conversations.filter((c) => c.id !== id),
 activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
 }));
 },
 
 renameConversation: (id, name) => {
 set((state) => ({
 conversations: state.conversations.map((c) =>
 c.id === id ? { ...c, name, updatedAt: new Date() } : c
 ),
 }));
 },
 
 pinConversation: (id) => {
 set((state) => ({
 conversations: state.conversations.map((c) =>
 c.id === id ? { ...c, pinned: !c.pinned } : c
 ),
 }));
 },
 
 setActiveConversation: (id) => {
 set({ activeConversationId: id });
 },
 
 addMessage: (conversationId, message) => {
 const newMessage: Message = {
 ...message,
 id: `msg-${Date.now()}`,
 };
 
 set((state) => ({
 conversations: state.conversations.map((c) =>
 c.id === conversationId
 ? {
 ...c,
 messages: [...c.messages, newMessage],
 updatedAt: new Date(),
 }
 : c
 ),
 }));
 },
 
 updateMessage: (conversationId, messageId, updates) => {
 set((state) => ({
 conversations: state.conversations.map((c) =>
 c.id === conversationId
 ? {
 ...c,
 messages: c.messages.map((m) =>
 m.id === messageId ? { ...m, ...updates } : m
 ),
 updatedAt: new Date(),
 }
 : c
 ),
 }));
 },
 
 deleteMessage: (conversationId, messageId) => {
 set((state) => ({
 conversations: state.conversations.map((c) =>
 c.id === conversationId
 ? {
 ...c,
 messages: c.messages.filter((m) => m.id !== messageId),
 updatedAt: new Date(),
 }
 : c
 ),
 }));
 },
 
 setIsGenerating: (isGenerating) => {
 set({ isGenerating });
 },
 
 stopGeneration: () => {
 set({ isGenerating: false });
 },
 
 setContext: (context) => {
 set({ selectedContext: context });
 },
 
 getActiveConversation: () => {
 const state = get();
 return state.conversations.find((c) => c.id === state.activeConversationId) || null;
 },
 }),
 {
 name: 'flightops-chat-storage',
 partialize: (state) => ({
 conversations: state.conversations,
 activeConversationId: state.activeConversationId,
 }),
 }
 )
);
