import type { ConversationListItem } from '@/lib/tanstack/hooks/useGeneralConversations';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export interface GroupedConversations {
  pinned: ConversationListItem[];
  today: ConversationListItem[];
  yesterday: ConversationListItem[];
  lastWeek: ConversationListItem[];
  older: ConversationListItem[];
}

export function groupConversationsByRecency(
  conversations: ConversationListItem[],
  referenceDate: Date = new Date()
): GroupedConversations {
  const startOfTodayUtc = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  );

  return conversations.reduce<GroupedConversations>(
    (groups, conversation) => {
      if (conversation.pinned) {
        groups.pinned.push(conversation);
        return groups;
      }

      const updatedDate = new Date(conversation.updated_at);
      const updatedDayUtc = Date.UTC(
        updatedDate.getUTCFullYear(),
        updatedDate.getUTCMonth(),
        updatedDate.getUTCDate()
      );

      const diffDays = Math.floor((startOfTodayUtc - updatedDayUtc) / MS_IN_DAY);

      if (diffDays <= 0) {
        groups.today.push(conversation);
      } else if (diffDays === 1) {
        groups.yesterday.push(conversation);
      } else if (diffDays <= 7) {
        groups.lastWeek.push(conversation);
      } else {
        groups.older.push(conversation);
      }

      return groups;
    },
    {
      pinned: [],
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    }
  );
}

export function sortConversationsByUpdatedAt(conversations: ConversationListItem[]) {
  return [...conversations].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
