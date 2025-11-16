import type { CoreMessage } from 'ai';

/**
 * Rough token estimator for routing decisions. Fast and deterministic.
 */
export function estimateTokens(messages: CoreMessage[]): number {
  const totalChars = messages.reduce((sum, message) => {
    const content = typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);
    return sum + content.length;
  }, 0);

  // Heuristic: ~4 characters per token
  return Math.ceil(totalChars / 4);
}
