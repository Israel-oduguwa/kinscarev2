"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type LastMessageSummary = {
  sid?: string | null;
  body?: string | null;
  author?: string | null;
  dateCreated?: string | Date | null;
  index?: number | null;
};

type ConversationsContextValue = {
  lastMessages: Record<string, LastMessageSummary>;
  setLastMessage: (conversationSid: string, message: LastMessageSummary) => void;
};

const ConversationsContext = createContext<ConversationsContextValue | null>(
  null
);

export function ConversationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lastMessages, setLastMessages] = useState<
    Record<string, LastMessageSummary>
  >({});

  const setLastMessage = useCallback(
    (conversationSid: string, message: LastMessageSummary) => {
      setLastMessages((prev) => {
        const existing = prev[conversationSid];
        const existingIndex =
          typeof existing?.index === "number" ? existing.index : -1;
        const nextIndex =
          typeof message.index === "number" ? message.index : existingIndex;

        if (
          existing &&
          message.sid &&
          existing.sid &&
          message.sid !== existing.sid &&
          nextIndex < existingIndex
        ) {
          return prev;
        }

        if (
          existing &&
          existing.sid === message.sid &&
          message.body === existing.body &&
          message.dateCreated === existing.dateCreated
        ) {
          return prev;
        }

        return {
          ...prev,
          [conversationSid]: {
            sid: message.sid ?? existing?.sid ?? null,
            body: message.body ?? existing?.body ?? null,
            author: message.author ?? existing?.author ?? null,
            dateCreated: message.dateCreated ?? existing?.dateCreated ?? null,
            index:
              typeof message.index === "number"
                ? message.index
                : existing?.index ?? null,
          },
        };
      });
    },
    []
  );

  const value = useMemo(
    () => ({ lastMessages, setLastMessage }),
    [lastMessages, setLastMessage]
  );

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversationsContext() {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error(
      "useConversationsContext must be used within ConversationsProvider."
    );
  }
  return context;
}
