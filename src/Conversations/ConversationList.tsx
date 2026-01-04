"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { CheckCheck, Loader2, MessageCircle } from "lucide-react";
import {
  ConversationAttributes,
  getOtherParticipant,
  parseConversationAttributes,
} from "@/Conversations/utils";
import { useApiClient } from "@/hooks/useApiClient";
import { useConversationsContext } from "@/Conversations/ConversationsContext";

type ConversationListItem = {
  conversationSid: string;
  conversationFriendlyName?: string | null;
  conversationAttributes?: string | ConversationAttributes | null;
  dateCreated?: string;
  dateUpdated?: string;
  lastMessage?: {
    body?: string;
    author?: string;
    dateCreated?: string;
    index?: number;
  } | null;
  lastReadMessageIndex?: number | null;
};

type ConversationListProps = {
  basePath: string;
  emptyLabel: string;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

export default function ConversationList({
  basePath,
  emptyLabel,
}: ConversationListProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { userData } = useAuthContext();
  const { privateApi } = useApiClient();
  const { lastMessages } = useConversationsContext();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const identity = userData?.userID;

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aDate = new Date(a.dateUpdated || a.dateCreated || 0).getTime();
      const bDate = new Date(b.dateUpdated || b.dateCreated || 0).getTime();
      return bDate - aDate;
    });
  }, [items]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!identity) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await privateApi.get("/api/conversations/list", {
          params: { identity },
        });
        if (!data?.success) {
          throw new Error(data?.message || "Failed to load conversations.");
        }

        setItems(data.data || []);
      } catch (error: any) {
        toast.error(error?.message || "Unable to load conversations.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [identity, isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Conversations
          </h1>
          <p className="text-sm text-slate-600">
            All your messages in one place.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2 rounded-full"
        >
          <MessageCircle size={16} />
          Refresh
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading conversations...
          </div>
        ) : null}

        {!isLoading && sortedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-10 text-center">
            <p className="text-sm font-semibold text-slate-800">{emptyLabel}</p>
            <p className="mt-1 text-sm text-slate-500">
              Start a chat from a caregiver profile to see it here.
            </p>
          </div>
        ) : null}

        {sortedItems.map((item) => {
          const attrs = parseConversationAttributes(item.conversationAttributes);
          const other = getOtherParticipant(attrs, identity);
          const contextMessage = lastMessages[item.conversationSid];
          const lastMessage = contextMessage?.body
            ? contextMessage
            : item.lastMessage || null;
          const preview = lastMessage?.body || "No messages yet.";
          const lastIndex =
            typeof lastMessage?.index === "number"
              ? lastMessage.index
              : null;
          const lastReadIndex =
            typeof item.lastReadMessageIndex === "number"
              ? item.lastReadMessageIndex
              : null;
          const lastAuthor = lastMessage?.author;
          const isMine = lastAuthor && lastAuthor === identity;
          const isRead =
            isMine &&
            lastReadIndex !== null &&
            lastIndex !== null &&
            lastReadIndex >= lastIndex;
          const dateLabel = formatDate(
            (lastMessage?.dateCreated as string | undefined) ||
              item.dateUpdated ||
              item.dateCreated
          );

          return (
            <Link
              key={item.conversationSid}
              href={`${basePath}/${item.conversationSid}`}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-25px_rgba(15,23,42,0.45)]"
            >
              <div className="relative">
                <ProfileAvatar
                  size="w-12 h-12"
                  name={other?.name || item.conversationFriendlyName || "Chat"}
                  profileImage={other?.avatar}
                />
                {isRead && isMine ? (
                  <span className="absolute -right-1 -bottom-1 rounded-full bg-white p-0.5 shadow">
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {other?.name || item.conversationFriendlyName || "Chat"}
                  </p>
                  <span className="text-xs text-slate-500">{dateLabel}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-600">
                  {isMine ? (
                    <CheckCheck
                      className={`h-4 w-4 ${
                        isRead ? "text-emerald-500" : "text-slate-300"
                      }`}
                    />
                  ) : null}
                  <span className="truncate">{preview}</span>
                </p>
              </div>
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-slate-200/60" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
