"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { CheckCheck, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

type ConversationSidebarProps = {
  basePath: string;
  emptyLabel: string;
  onNavigate?: () => void;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const getActiveSid = (pathname: string, basePath: string) => {
  if (!pathname.startsWith(basePath)) return null;
  const parts = pathname.replace(basePath, "").split("/").filter(Boolean);
  return parts[0] || null;
};

export default function ConversationSidebar({
  basePath,
  emptyLabel,
  onNavigate,
}: ConversationSidebarProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { userData } = useAuthContext();
  const pathname = usePathname();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const { privateApi } = useApiClient();
  const { lastMessages } = useConversationsContext();

  const identity = userData?.userID;
  const myName =
    [userData?.fname, userData?.lname].filter(Boolean).join(" ") ||
    userData?.name ||
    "You";
  const activeSid = getActiveSid(pathname, basePath);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aDate = new Date(a.dateUpdated || a.dateCreated || 0).getTime();
      const bDate = new Date(b.dateUpdated || b.dateCreated || 0).getTime();
      return bDate - aDate;
    });
  }, [items]);

  const loadConversations = useCallback(async () => {
    if (!identity) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
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
      isFetchingRef.current = false;
    }
  }, [identity]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!identity) return;
    loadConversations();

    const handleRefresh = () => loadConversations();
    window.addEventListener("conversations:refresh", handleRefresh);

    return () => {
      window.removeEventListener("conversations:refresh", handleRefresh);
    };
  }, [identity, isLoaded, isSignedIn, loadConversations]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Conversations</p>
          <p className="text-xs text-slate-500">Tap a chat to continue</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadConversations}
          aria-label="Refresh conversations"
          className="rounded-full"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {isLoading && sortedItems.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.3)]"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && sortedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-6 text-center shadow-[0_18px_30px_-26px_rgba(15,23,42,0.3)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <RefreshCcw className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {emptyLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Start a chat from a profile to see it here.
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
          const rawPreview = lastMessage?.body || "No messages yet.";
          const prefixes = [myName, other?.name, "You"].filter(Boolean);
          let preview = rawPreview;
          for (const prefix of prefixes) {
            const withColon = `${prefix}: `;
            if (rawPreview.startsWith(withColon)) {
              preview = rawPreview.slice(withColon.length);
              break;
            }
          }
          const lastIndex =
            typeof lastMessage?.index === "number"
              ? lastMessage?.index
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
          const hasUnread =
            typeof lastIndex === "number" &&
            typeof lastReadIndex === "number" &&
            lastIndex > lastReadIndex;
          const isActive = activeSid === item.conversationSid;
          const dateLabel = formatDate(
            (lastMessage?.dateCreated as string | undefined) ||
              item.dateUpdated ||
              item.dateCreated
          );

          return (
            <Link
              key={item.conversationSid}
              href={`${basePath}/${item.conversationSid}`}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all ${
                isActive
                  ? "border-blue-200 bg-gradient-to-r from-blue-50 via-white to-white shadow-[0_18px_35px_-28px_rgba(37,99,235,0.45)]"
                  : "border-slate-200/70 bg-white/90 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_30px_-26px_rgba(15,23,42,0.35)]"
              }`}
            >
              <div className="relative">
                <ProfileAvatar
                  size="w-11 h-11"
                  name={other?.name || item.conversationFriendlyName || "Chat"}
                  profileImage={other?.avatar}
                />
                {hasUnread ? (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {other?.name || item.conversationFriendlyName || "Chat"}
                  </p>
                  <span className="text-[10px] text-slate-400">{dateLabel}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                  {isMine ? (
                    <CheckCheck
                      className={`h-3 w-3 ${
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
