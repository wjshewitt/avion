'use client';

type TitleRequestReason = 'drawer-close' | 'window-unload' | 'conversation-switch' | 'manual';

const inFlightRequests = new Set<string>();
const CLEAR_DELAY_MS = 10_000;

export function requestConversationTitle(
  conversationId: string | null | undefined,
  reason: TitleRequestReason = 'manual',
) {
  if (!conversationId) return;

  if (inFlightRequests.has(conversationId)) {
    return;
  }

  inFlightRequests.add(conversationId);
  const payload = JSON.stringify({ reason });
  const endpoint = `/api/chat/conversations/${conversationId}/title`;
  const clear = () => {
    setTimeout(() => inFlightRequests.delete(conversationId), CLEAR_DELAY_MS);
  };

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) {
        clear();
        return;
      }
    } catch {
      // Fallback to fetch
    }
  }

  if (typeof fetch === 'function') {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
      .catch(() => null)
      .finally(clear);
  } else {
    inFlightRequests.delete(conversationId);
  }
}
