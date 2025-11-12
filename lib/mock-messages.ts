import { Message } from './types';

export const mockMessages: Message[] = [
 {
 id: '1',
 role: 'assistant',
 content: 'Hello! I\'m your FlightOps AI assistant. I can help with flight briefings, weather analysis, and operational decisions. What would you like to know?',
 timestamp: new Date(Date.now() - 3600000),
 },
];

export const suggestedQuestions = [
 'What\'s the weather for this flight?',
 'Show me risks for FL123',
 'Best departure window?',
 'Compare routes to LAX',
];
