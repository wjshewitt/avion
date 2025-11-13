import { memo } from"react"
import {
 ChatMessage,
 type ChatMessageProps,
 type Message,
} from"@/components/ui/chat-message"
import { TypingIndicator } from"@/components/ui/typing-indicator"

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>

interface MessageListProps {
 messages: Message[]
 showTimeStamps?: boolean
 isTyping?: boolean
 messageOptions?:
 | AdditionalMessageOptions
 | ((message: Message) => AdditionalMessageOptions)
}

// Memoized individual message component to prevent re-rendering all messages
const MemoizedMessage = memo<ChatMessageProps>(
 function MemoizedMessage(props) {
 return <ChatMessage {...props} />
 }
)

export function MessageList({
 messages,
 showTimeStamps = true,
 isTyping = false,
 messageOptions,
}: MessageListProps) {
 return (
 <div className="space-y-4 overflow-visible flex flex-col">
 {messages.map((message) => {
 const additionalOptions =
 typeof messageOptions ==="function"
 ? messageOptions(message)
 : messageOptions

 return (
 <MemoizedMessage
 key={message.id}
 message={message}
 showTimeStamp={showTimeStamps}
 {...additionalOptions}
 />
 )
 })}
 {isTyping && <TypingIndicator />}
 </div>
 )
}
