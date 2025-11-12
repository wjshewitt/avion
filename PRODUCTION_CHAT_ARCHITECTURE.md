# Production Chat Architecture

## Overview

The chat system now uses a production-grade architecture with optimistic UI updates, proper caching, and clean separation between server state and UI state.

## Architecture Layers

### Layer 1: Server State (TanStack Query)

**File:** `lib/tanstack/hooks/useSendMessage.ts`

Handles all server communication with optimistic updates:

```typescript
const sendMessageMutation = useSendMessage();

// Automatically handles:
// - Optimistic UI updates (message appears immediately)
// - Loading states
// - Error rollback
// - Cache invalidation
// - Retry logic
```

**Features:**
- ✅ **Optimistic Updates**: User message + AI placeholder appear instantly
- ✅ **Automatic Rollback**: On error, removes optimistic messages and restores previous state
- ✅ **Cache Synchronization**: Invalidates queries to fetch real messages from server
- ✅ **Type Safety**: Full TypeScript support with proper error types

### Layer 2: UI State (usePremiumChat)

**File:** `hooks/usePremiumChat.ts`

Handles only local UI state:

```typescript
const {
  input,
  setInput,
  sendMessage,
  isStreaming,
  isThinking,
  error
} = usePremiumChat({
  conversationId: activeConversationId,
  onConversationCreated: (id) => {},
  onError: (error) => {}
});
```

**Responsibilities:**
- Input field state
- Send message action
- Derived loading states from mutation
- Error handling callbacks

**NOT responsible for:**
- ❌ Message storage
- ❌ Server communication
- ❌ Cache management

### Layer 3: Message Display (TanStack Query)

**File:** `lib/tanstack/hooks/useConversationMessages.ts`

Fetches and caches messages from database:

```typescript
const { data, isLoading } = useConversationMessages(activeConversationId);
const messages = data?.messages || [];
```

**Caching Strategy:**
- `staleTime: 10s` - Data is fresh for 10 seconds
- `gcTime: 5min` - Cache kept for 5 minutes
- `refetchOnWindowFocus: true` - Refetch when tab gains focus

## Data Flow

### Sending a Message

```
User types → Input state → sendMessage() →
  ↓
useSendMessage mutation
  ↓
1. Optimistic update: Add temp user message + AI placeholder to cache
2. API call: POST /api/chat/general
3. On success: Remove temp messages, invalidate cache
4. On error: Rollback to previous state
  ↓
useConversationMessages refetches
  ↓
Real messages from database displayed
```

### Switching Conversations

```
User clicks conversation → setActiveConversation(id) →
  ↓
useConversationMessages(id) fetches from cache/server
  ↓
Messages displayed instantly (if cached) or after fetch
```

## Key Features

### 1. Optimistic UI Updates

Messages appear immediately without waiting for server:

```typescript
// In useSendMessage onMutate
const optimisticUserMessage = {
  id: `temp-user-${Date.now()}`,
  role: 'user',
  content: messageContent,
  // ...
};

const optimisticAIMessage = {
  id: `temp-ai-${Date.now()}`,
  role: 'assistant',
  content: '', // Empty while generating
  // ...
};

queryClient.setQueryData(['conversation-messages', conversationId], (old) => ({
  messages: [...(old?.messages || []), optimisticUserMessage, optimisticAIMessage],
  notFound: false,
}));
```

### 2. Automatic Error Recovery

On error, optimistic updates are rolled back:

```typescript
// In useSendMessage onError
onError: (error, variables, context) => {
  if (context?.previousMessages) {
    queryClient.setQueryData(
      ['conversation-messages', variables.conversationId],
      context.previousMessages
    );
  }
},
```

### 3. Cache Invalidation

After successful send, cache is invalidated to fetch real data:

```typescript
// In useSendMessage onSuccess
queryClient.invalidateQueries({
  queryKey: ['conversation-messages', conversationId],
});

queryClient.invalidateQueries({
  queryKey: ['general-conversations'],
});
```

### 4. Loading States

Visual feedback while AI is thinking:

```typescript
const isLoading = isStreaming || isThinking;

// In Chat component
<Chat
  messages={transformedMessages}
  isGenerating={isLoading}
  // ... shows loading indicator
/>
```

### 5. Error Handling

Errors restore input and notify user:

```typescript
catch (err) {
  // Restore input so user can retry
  setInput(messageContent);
  
  // Notify error handler
  onError?.(error);
}
```

## Caching Configuration

### Global Settings

**File:** `lib/tanstack/client.ts`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30s default
      gcTime: 5 * 60 * 1000, // 5min garbage collection
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (isAuthError(error)) return false;
        if (isNetworkError(error)) return failureCount < 3;
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Per-Query Overrides

```typescript
// Conversation messages (real-time)
useConversationMessages: {
  staleTime: 10_000, // 10 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
}

// Conversations list (less frequent)
useGeneralConversations: {
  staleTime: 30_000, // 30 seconds
}

// Airport data (rarely changes)
useAirports: {
  staleTime: 60 * 60 * 1000, // 1 hour
  gcTime: 24 * 60 * 60 * 1000, // 24 hours
}
```

## Query Keys

Hierarchical structure for granular invalidation:

```typescript
['conversation-messages', conversationId] // Individual conversation messages
['general-conversations']                 // List of all conversations
['conversation', conversationId]          // Full conversation details
```

### Invalidation Rules

```typescript
// After sending message
invalidate: ['conversation-messages', conversationId]
invalidate: ['general-conversations']

// After creating conversation
invalidate: ['general-conversations']
setData: ['conversation-messages', newId] = []

// After deleting conversation
invalidate: ['general-conversations']
removeQueries: ['conversation-messages', deletedId]
```

## Testing Checklist

- [x] Message appears immediately when sent
- [x] Loading indicator shows while AI responds
- [x] AI response appears when ready
- [x] No duplicate messages
- [x] Error shows and rolls back optimistic update
- [x] Input restored after error for retry
- [x] Switching conversations works
- [x] New conversation creation works
- [x] Cache persists across page navigation
- [x] Stale data refetches in background

## Performance Benefits

### Before (Local State)
- ⏱️ **Perceived Latency**: 2-5 seconds (wait for API)
- 🐛 **State Bugs**: Sync issues between local and server state
- 🔄 **No Caching**: Refetch on every navigation
- ❌ **No Rollback**: Errors left UI in bad state

### After (TanStack Query)
- ⚡ **Perceived Latency**: 0ms (instant optimistic update)
- ✅ **No State Bugs**: Single source of truth (server)
- ⚡ **Smart Caching**: Instant navigation with cached data
- ✅ **Automatic Rollback**: Errors handled gracefully

## Debugging

### React Query DevTools

Add to your app for visual debugging:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Console Logging

Enable query logging:

```typescript
const queryClient = new QueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
});
```

## Migration Guide

### Old Pattern (Deprecated)
```typescript
// ❌ DON'T: Manage messages in local state
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');

const sendMessage = async () => {
  setMessages([...messages, userMessage]);
  const response = await fetch('/api/chat');
  setMessages([...messages, userMessage, aiMessage]);
};
```

### New Pattern (Current)
```typescript
// ✅ DO: Use TanStack Query for server state
const { data } = useConversationMessages(conversationId);
const messages = data?.messages || [];

const { sendMessage, input, setInput } = usePremiumChat({
  conversationId,
  onConversationCreated: (id) => {},
});
```

## Common Patterns

### Sending a Message
```typescript
const handleSubmit = async () => {
  if (!input.trim()) return;
  await sendMessage();
};
```

### Retry After Error
```typescript
const handleRetry = () => {
  sendMessage(input); // Input was restored on error
};
```

### Cancel Request
```typescript
const handleCancel = () => {
  stopStreaming();
};
```

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/guides/optimistic-updates)
- [Cache Management](https://tanstack.com/query/latest/docs/guides/caching)
