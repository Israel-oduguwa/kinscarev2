"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Client as ConversationsClient,
  Conversation,
  Message,
} from "@twilio/conversations";
import { useAuth, useUser } from "@clerk/nextjs";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CheckCheck,
  Flag,
  Loader2,
  MessageCircle,
  MoreVertical,
  Pencil,
  Reply,
  SendHorizontal,
  Star,
  Trash2,
  X,
  Paperclip,
  Mic,
  Smile,
  Video,
  Phone,
  Info,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ConversationAttributes,
  getOtherParticipant,
  parseConversationAttributes,
} from "@/Conversations/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApiClient } from "@/hooks/useApiClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SheetTrigger } from "@/components/ui/sheet";
import { useConversationsContext } from "@/Conversations/ConversationsContext";

const formatTimestamp = (value?: Date | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
};

const isSameDay = (left?: Date | null, right?: Date | null) => {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const formatDayLabel = (value?: Date | null) => {
  if (!value) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const base = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);
  if (isSameDay(value, today)) return `Today`;
  if (isSameDay(value, yesterday)) return `Yesterday`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);
};

type ConversationRoomProps = {
  conversationSid: string;
  basePath: string;
  variant?: "full" | "embedded";
};

export default function ConversationRoom({
  conversationSid,
  basePath,
  variant = "full",
}: ConversationRoomProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { userData } = useAuthContext();
  const { privateApi } = useApiClient();
  const { setLastMessage } = useConversationsContext();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingMessageSid, setEditingMessageSid] = useState<string | null>(
    null
  );
  const [editBody, setEditBody] = useState("");
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [activeMessageSid, setActiveMessageSid] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("scam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportingMessage, setReportingMessage] = useState<Message | null>(
    null
  );
  const [isReporting, setIsReporting] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [otherOnline, setOtherOnline] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherReadIndex, setOtherReadIndex] = useState<number | null>(null);
  const [attributes, setAttributes] = useState<ConversationAttributes>({});
  const [connectionState, setConnectionState] = useState<string>("connecting");
  const [isRecording, setIsRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const refreshInFlight = useRef(false);
  const lastTypingSentRef = useRef(0);
  const initialScrollDoneRef = useRef(false);

  const identity = userData?.userID || "";
  const isProvider =
    userData?.role === "provider" || userData?.settings?.role === "provider";
  const myName =
    [userData?.fname, userData?.lname].filter(Boolean).join(" ") ||
    userData?.name ||
    "You";
  const sanitizeImageUrl = (value?: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
    if (!/^https?:\/\//i.test(trimmed)) return null;
    return trimmed;
  };

  // console.log("Mine", user?.imageUrl);
  const myAvatar = sanitizeImageUrl(user?.imageUrl || null);

  const otherParticipant = useMemo(
    () => getOtherParticipant(attributes, identity),
    [attributes, identity]
  );
  const otherAvatar = sanitizeImageUrl(otherParticipant?.avatar || null);

  // Enhanced auto-scroll with smooth behavior
  useEffect(() => {
    if (!messagesContainerRef.current || isLoading) return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.clientHeight - container.scrollTop <
      100;

    if (isNearBottom || !initialScrollDoneRef.current) {
      const behavior = initialScrollDoneRef.current ? "smooth" : "instant";
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
      initialScrollDoneRef.current = true;
    }
  }, [messages, isLoading]);

  // Load conversation logic remains the same...
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!identity) return;

    let activeConversation: Conversation | null = null;
    let activeClient: ConversationsClient | null = null;
    let isMounted = true;

    const loadConversation = async () => {
      setIsLoading(true);
      try {
        const { data: tokenData } = await privateApi.post(
          "/api/conversations/token",
          { identity }
        );
        if (!tokenData?.success) {
          throw new Error(tokenData?.message || "Unable to load chat token.");
        }

        const createClient = (token: string) =>
          new Promise<ConversationsClient>((resolve, reject) => {
            const twilioClient = new ConversationsClient(token);

            const handleInitialized = () => {
              cleanup();
              setConnectionState(twilioClient.connectionState || "connected");
              resolve(twilioClient);
            };

            const handleFailed = (event: { error?: Error }) => {
              cleanup();
              reject(event?.error || new Error("Chat initialization failed."));
            };

            const cleanup = () => {
              twilioClient.removeListener("initialized", handleInitialized);
              twilioClient.removeListener("initFailed", handleFailed);
            };

            twilioClient.on("initialized", handleInitialized);
            twilioClient.on("initFailed", handleFailed);
          });

        activeClient = await createClient(tokenData.data.token);
        if (!isMounted) return;

        const refreshToken = async () => {
          if (refreshInFlight.current) return;
          refreshInFlight.current = true;
          try {
            const { data: refreshData } = await privateApi.post(
              "/api/conversations/token",
              { identity }
            );
            if (refreshData?.success) {
              activeClient?.updateToken(refreshData.data.token);
            } else {
              throw new Error(
                refreshData?.message || "Unable to refresh chat token."
              );
            }
          } catch (error: any) {
            toast.error(error?.message || "Chat token refresh failed.", {
              action: {
                label: "Refresh",
                onClick: refreshToken,
              },
            });
          } finally {
            refreshInFlight.current = false;
          }
        };

        activeClient.on("tokenAboutToExpire", refreshToken);
        activeClient.on("tokenExpired", refreshToken);
        activeClient.on("connectionStateChanged", (state) => {
          setConnectionState(state);
          if (state === "disconnected" || state === "denied") {
            refreshToken();
          }
        });

        activeConversation = await activeClient.getConversationBySid(
          conversationSid
        );
        try {
          await activeConversation.join();
        } catch (_err) {
          // Ignore if already joined.
        }

        if (!isMounted) return;
        setConversation(activeConversation);
        const attrs = parseConversationAttributes(
          activeConversation.attributes as any
        );
        setAttributes(attrs);

        const messagesPage = await activeConversation.getMessages(60);
        setMessages(messagesPage.items);
        const latest = messagesPage.items[messagesPage.items.length - 1];
        if (latest) {
          setLastMessage(conversationSid, {
            sid: latest.sid,
            body: latest.body || "",
            author: latest.author || "",
            dateCreated: latest.dateCreated || null,
            index: latest.index ?? null,
          });
        }

        const unread = await activeConversation.getUnreadMessagesCount();
        setUnreadCount(unread);
        await activeConversation.setAllMessagesRead();
        setUnreadCount(0);

        const participants = await activeConversation.getParticipants();
        const otherIdentity =
          getOtherParticipant(attrs, identity)?.id ||
          participants.find((participant) => participant.identity !== identity)
            ?.identity ||
          null;
        const otherEntry = participants.find(
          (participant) => participant.identity === otherIdentity
        );
        if (typeof otherEntry?.lastReadMessageIndex === "number") {
          setOtherReadIndex(otherEntry.lastReadMessageIndex);
        }

        activeConversation.on("messageAdded", async (message) => {
          setMessages((prev) => {
            if (prev.some((item) => item.sid === message.sid)) {
              return prev;
            }
            return [...prev, message];
          });
          setLastMessage(conversationSid, {
            sid: message.sid,
            body: message.body || "",
            author: message.author || "",
            dateCreated: message.dateCreated || null,
            index: message.index ?? null,
          });
          if (message.author !== identity) {
            const unread = await activeConversation.getUnreadMessagesCount();
            setUnreadCount(unread);
            try {
              await activeConversation.setAllMessagesRead();
              setUnreadCount(0);
            } catch (_err) {
              // Ignore read receipt failures.
            }
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("conversations:refresh"));
          }
        });

        activeConversation.on("messageRemoved", (message) => {
          setMessages((prev) =>
            prev.filter((item) => item.sid !== message.sid)
          );
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("conversations:refresh"));
          }
        });

        activeConversation.on("messageUpdated", (event) => {
          setMessages((prev) =>
            prev.map((item) =>
              item.sid === event.message.sid ? event.message : item
            )
          );
          setLastMessage(conversationSid, {
            sid: event.message.sid,
            body: event.message.body || "",
            author: event.message.author || "",
            dateCreated: event.message.dateCreated || null,
            index: event.message.index ?? null,
          });
        });

        activeConversation.on("updated", (event) => {
          if (event.updateReasons.includes("attributes")) {
            setAttributes(
              parseConversationAttributes(event.conversation.attributes as any)
            );
          }
        });

        activeConversation.on("typingStarted", (participant) => {
          if (participant.identity && participant.identity !== identity) {
            setIsOtherTyping(true);
          }
        });

        activeConversation.on("typingEnded", (participant) => {
          if (participant.identity && participant.identity !== identity) {
            setIsOtherTyping(false);
          }
        });

        activeConversation.on("participantUpdated", ({ participant }) => {
          if (participant.identity && participant.identity !== identity) {
            setOtherReadIndex(participant.lastReadMessageIndex ?? null);
          }
        });

        const other = getOtherParticipant(attrs, identity);
        if (other?.id) {
          const otherUser = await activeClient.getUser(other.id);
          setOtherOnline(!!otherUser?.isOnline);
          otherUser.on("updated", ({ user }) => {
            setOtherOnline(!!user?.isOnline);
          });
        }
      } catch (error: any) {
        toast.error(error?.message || "Unable to load conversation.");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();

    return () => {
      isMounted = false;
      activeConversation?.removeAllListeners();
      activeClient?.removeAllListeners();
    };
  }, [conversationSid, identity, isLoaded, isSignedIn]);

  const handleTyping = () => {
    if (!conversation) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = now;
    conversation.typing();
  };

  const handleSend = async () => {
    if (!conversation || !messageBody.trim()) return;
    setIsSending(true);
    try {
      const plainBody = messageBody.trim();
      const prefixedBody = `${myName}: ${plainBody}`;
      const replyPayload =
        replyTo && replyTo.sid
          ? {
              sid: replyTo.sid,
              author: replyTo.author || "",
              authorName:
                replyTo.author === identity
                  ? "You"
                  : otherParticipant?.name || "Caregiver",
              body: extractPlainBody(replyTo),
            }
          : null;
      await conversation.sendMessage(prefixedBody, {
        plainBody,
        displayName: myName,
        replyTo: replyPayload,
      });
      setMessageBody("");
      setReplyTo(null);
      await conversation.setAllMessagesRead();
      setUnreadCount(0);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("conversations:refresh"));
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const extractPlainBody = (message: Message) => {
    if (message.attributes && typeof message.attributes === "object") {
      const attrs = message.attributes as Record<string, any>;
      if (typeof attrs.plainBody === "string") {
        return attrs.plainBody;
      }
    }
    if (typeof message.body === "string") {
      const prefix = `${myName}: `;
      if (message.body.startsWith(prefix)) {
        return message.body.slice(prefix.length);
      }
    }
    return message.body || "";
  };

  const startEditMessage = (message: Message) => {
    setEditingMessageSid(message.sid);
    setEditBody(extractPlainBody(message));
  };

  const cancelEditMessage = () => {
    setEditingMessageSid(null);
    setEditBody("");
  };

  const saveEditMessage = async (message: Message) => {
    const plainBody = editBody.trim();
    if (!plainBody) return;
    setIsUpdatingMessage(true);
    try {
      const prefixedBody = `${myName}: ${plainBody}`;
      await message.updateBody(prefixedBody);
      const existingAttrs =
        message.attributes && typeof message.attributes === "object"
          ? (message.attributes as Record<string, any>)
          : {};
      await message.updateAttributes({
        ...existingAttrs,
        plainBody,
        displayName: myName,
        edited: true,
        editedAt: new Date().toISOString(),
      });
      cancelEditMessage();
    } catch (error: any) {
      toast.error(error?.message || "Failed to edit message.");
    } finally {
      setIsUpdatingMessage(false);
    }
  };

  const deleteMessage = async (message: Message) => {
    setIsUpdatingMessage(true);
    try {
      const existingAttrs =
        message.attributes && typeof message.attributes === "object"
          ? (message.attributes as Record<string, any>)
          : {};
      await message.updateBody(`${myName}: [message deleted]`);
      await message.updateAttributes({
        ...existingAttrs,
        deleted: true,
        deletedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete message.");
    } finally {
      setIsUpdatingMessage(false);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const toggleFavoriteMessage = async (
    message: Message,
    isFavorited: boolean
  ) => {
    setIsUpdatingMessage(true);
    try {
      const existingAttrs =
        message.attributes && typeof message.attributes === "object"
          ? (message.attributes as Record<string, any>)
          : {};
      const currentList = Array.isArray(existingAttrs.favoritedBy)
        ? existingAttrs.favoritedBy
        : [];
      const nextList = isFavorited
        ? currentList.filter((id: string) => id !== identity)
        : [...new Set([...currentList, identity])];
      await message.updateAttributes({
        ...existingAttrs,
        favoritedBy: nextList,
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to update favorite.");
    } finally {
      setIsUpdatingMessage(false);
    }
  };

  const openReport = (message: Message) => {
    setReportingMessage(message);
    setReportReason("scam");
    setReportDetails("");
    setReportOpen(true);
  };

  const submitReport = async () => {
    if (!reportingMessage) return;
    setIsReporting(true);
    try {
      const reportedUserId =
        reportingMessage.author !== identity
          ? otherParticipant?.id || reportingMessage.author
          : undefined;
      const { data } = await privateApi.post("/api/conversations/report", {
        conversationSid,
        reason: reportReason,
        message: reportDetails,
        reportedUserId,
      });
      if (!data?.success) {
        throw new Error(data?.message || "Unable to submit report.");
      }
      toast.success("Report submitted.");
      setReportOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit report.");
    } finally {
      setIsReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!conversationSid) return;
    setIsDeleting(true);
    try {
      const { data } = await privateApi.post("/api/conversations/delete", {
        conversationSid,
      });
      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete conversation.");
      }
      toast.success("Conversation deleted.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("conversations:refresh"));
      }
      router.push(basePath);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete conversation.");
    } finally {
      setIsDeleting(false);
    }
  };

  const headerName =
    otherParticipant?.name ||
    conversation?.friendlyName ||
    conversation?.uniqueName ||
    "Conversation";

  const lastMyMessageIndex = useMemo(() => {
    const last = [...messages]
      .reverse()
      .find((item) => item.author === identity);
    return typeof last?.index === "number" ? last.index : null;
  }, [identity, messages]);

  // Mobile responsive classes
  const containerClasses =
    variant === "embedded"
      ? "flex h-full min-h-0 w-full flex-col px-0 py-0"
      : "flex h-screen w-full flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 md:rounded-2xl md:shadow-2xl md:m-2";

  return (
    <div className={containerClasses}>
      {/* Modern Header */}
      <div className="sticky top-0 z-50 shadow-2xl shadow-blue-100 flex items-center justify-between border-b border-white/20 bg-linear-to-r from-white/90 via-white/95 to-white backdrop-blur-xl px-4 py-3 md:rounded-t-2xl md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className=" md:hidden"
                aria-label="Open conversations"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <Link
              href={basePath}
              className="hidden rounded-full border border-slate-200/60 p-2 text-slate-600 transition-all hover:scale-105 hover:bg-white hover:shadow-sm md:inline-flex"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="relative">
              <ProfileAvatar
                size="w-12 h-12"
                name={headerName}
                profileImage={otherAvatar || undefined}
                className="ring-2 ring-white/80 ring-offset-2"
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  otherOnline ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900">
              {headerName}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    otherOnline
                      ? "animate-pulse bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                />
                <span className="text-xs text-slate-600">
                  {isOtherTyping ? (
                    <span className="flex items-center gap-1">
                      <span className="flex h-2 items-center">
                        <span className="inline-block h-1 w-1 animate-typing-dot rounded-full bg-blue-500" />
                        <span className="inline-block h-1 w-1 animate-typing-dot rounded-full bg-blue-500 animation-delay-150" />
                        <span className="inline-block h-1 w-1 animate-typing-dot rounded-full bg-blue-500 animation-delay-300" />
                      </span>
                      Typing...
                    </span>
                  ) : otherOnline ? (
                    "Online"
                  ) : (
                    "Offline"
                  )}
                </span>
              </div>
              {connectionState !== "connected" && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  {connectionState}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Phone size={18} />
          </Button> */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Video size={18} />
          </Button> */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-600 hover:bg-slate-100"
          >
            <Info size={18} />
          </Button> */}
          {isProvider && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all messages in this
                    conversation. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {isDeleting ? "Deleting..." : "Delete Conversation"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 bg-gray-100 overflow-y-auto px-3 py-4 md:px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300/50 hover:scrollbar-thumb-slate-400/50"
      >
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`flex ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                } animate-pulse`}
              >
                <div className="flex max-w-[85%] items-end gap-3">
                  {index % 2 === 0 && (
                    <Skeleton className="h-10 w-10 rounded-full" />
                  )}
                  <div className="space-y-2">
                    <Skeleton
                      className={`h-12 rounded-3xl ${
                        index % 2 === 0 ? "w-48" : "w-56"
                      }`}
                    />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  {index % 2 !== 0 && (
                    <Skeleton className="h-10 w-10 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl" />
              <div className="relative rounded-full bg-gradient-to-r from-blue-100 to-purple-100 p-8">
                <MessageCircle className="h-16 w-16 text-slate-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              Start the conversation
            </h3>
            <p className="max-w-sm text-sm text-slate-600">
              Send your first message to begin your conversation with{" "}
              {otherParticipant?.name || "this contact"}
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {messages.map((message, index) => {
              const isMine = message.author === identity;
              const previous = messages[index - 1];
              const showDate =
                index === 0 ||
                !isSameDay(
                  previous?.dateCreated ? new Date(previous.dateCreated) : null,
                  message.dateCreated ? new Date(message.dateCreated) : null
                );

              const messageAttrs =
                message.attributes && typeof message.attributes === "object"
                  ? (message.attributes as Record<string, any>)
                  : {};
              const isDeleted = Boolean(messageAttrs.deleted);
              const isEdited = Boolean(messageAttrs.edited);
              const isFavorited = Array.isArray(messageAttrs.favoritedBy)
                ? messageAttrs.favoritedBy.includes(identity)
                : false;
              const replyMeta =
                messageAttrs.replyTo && typeof messageAttrs.replyTo === "object"
                  ? (messageAttrs.replyTo as {
                      authorName?: string;
                      body?: string;
                    })
                  : null;

              return (
                <div key={message.sid} className="space-y-4">
                  {showDate && (
                    <div className="flex justify-center">
                      <div className="rounded-full bg-white/80 px-4 py-1.5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] backdrop-blur-sm">
                        <span className="text-xs font-medium text-slate-600">
                          {formatDayLabel(
                            message.dateCreated
                              ? new Date(message.dateCreated)
                              : null
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`group flex items-start gap-3 ${
                      isMine ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    {!isMine && (
                      <ProfileAvatar
                        size="w-10 h-10"
                        name={otherParticipant?.name || "Contact"}
                        profileImage={otherAvatar || undefined}
                        className="ring-1 ring-white/50"
                      />
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative max-w-[85%] ${
                        isMine ? "mr-2" : "ml-2"
                      }`}
                    >
                      <div
                        className={`relative rounded-3xl px-5 py-3 ${
                          isMine
                            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white"
                            : "bg-white text-slate-800 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]"
                        } ${isDeleted ? "opacity-60" : ""}`}
                      >
                        {/* Reply Preview */}
                        {replyMeta && !isDeleted && (
                          <div
                            className={`mb-3 rounded-2xl border-l-4 pl-3 pr-2 py-2 ${
                              isMine
                                ? "border-blue-300/50 bg-white/10"
                                : "border-slate-200 bg-slate-50/80"
                            }`}
                          >
                            <p className="text-xs font-medium">
                              Replying to {replyMeta.authorName}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs opacity-90">
                              {replyMeta.body}
                            </p>
                          </div>
                        )}

                        {/* Message Content */}
                        {editingMessageSid === message.sid ? (
                          <div className="space-y-3">
                            <div className="text-xs font-medium text-slate-400">
                              Editing message
                            </div>
                            <Textarea
                              value={editBody}
                              onChange={(e) => setEditBody(e.target.value)}
                              className="min-h-[80px] resize-none bg-white/10 text-white placeholder:text-white/50 focus:ring-0"
                              placeholder="Edit your message..."
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditMessage}
                                className="text-white/70 hover:text-white"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-white text-blue-600 hover:bg-white/90"
                                onClick={() => saveEditMessage(message)}
                                disabled={!editBody.trim() || isUpdatingMessage}
                              >
                                {isUpdatingMessage ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`whitespace-pre-wrap break-words ${
                                isDeleted
                                  ? "italic text-current/70"
                                  : "leading-relaxed"
                              }`}
                            >
                              {isDeleted
                                ? "Message deleted"
                                : extractPlainBody(message)}
                            </p>

                            {/* Message Footer */}
                            <div
                              className={`mt-2 flex items-center justify-between ${
                                isMine ? "text-white/70" : "text-slate-500"
                              }`}
                            >
                              <div className="flex items-center gap-2 text-xs">
                                {isEdited && !isDeleted && (
                                  <span className="italic">edited</span>
                                )}
                                {formatTimestamp(message.dateCreated)}
                              </div>
                              {isMine && (
                                <CheckCheck
                                  className={`h-4 w-4 ${
                                    otherReadIndex &&
                                    message.index &&
                                    message.index <= otherReadIndex
                                      ? "text-emerald-300"
                                      : "text-current/40"
                                  }`}
                                />
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Message Actions */}
                      {!isDeleted && editingMessageSid !== message.sid && (
                        <div
                          className={`pointer-events-none absolute -bottom-4 ${
                            isMine ? "right-2" : "left-2"
                          }`}
                        >
                          <div
                            className={`pointer-events-auto flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-lg transition-all duration-200 ${
                              activeMessageSid === message.sid
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                            }`}
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className={`h-7 w-7 rounded-full ${
                                isFavorited
                                  ? "text-amber-500"
                                  : "text-slate-400"
                              }`}
                              onClick={() =>
                                toggleFavoriteMessage(message, isFavorited)
                              }
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  isFavorited ? "fill-current" : ""
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-7 w-7 rounded-full text-slate-400"
                              onClick={() => handleReply(message)}
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="h-7 w-7 rounded-full text-slate-400"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align={isMine ? "end" : "start"}
                                className="min-w-[160px] rounded-xl"
                              >
                                {message.author === identity && !isDeleted && (
                                  <DropdownMenuItem
                                    onClick={() => startEditMessage(message)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {message.author === identity && (
                                  <DropdownMenuItem
                                    onClick={() => deleteMessage(message)}
                                    className="text-rose-600 focus:text-rose-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                                {message.author !== identity && (
                                  <DropdownMenuItem
                                    onClick={() => openReport(message)}
                                  >
                                    <Flag className="mr-2 h-4 w-4" />
                                    Report
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* My Avatar */}
                    {isMine && (
                      <ProfileAvatar
                        size="w-10 h-10"
                        name={myName}
                        profileImage={myAvatar || undefined}
                        className="ring-1 ring-white/50"
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Modern Input Area */}
      <div className="sticky bottom-0 z-40 border-t border-white/20 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-xl px-4 py-4 md:rounded-b-2xl md:px-6">
        {replyTo && (
          <div className="mb-3 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/50 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-sm font-medium text-slate-800">
                    Replying to{" "}
                    <span className="text-blue-600">
                      {replyTo.author === identity
                        ? "you"
                        : otherParticipant?.name || "them"}
                    </span>
                  </p>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                  {extractPlainBody(replyTo)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setReplyTo(null)}
                className="h-8 w-8 rounded-full text-slate-500 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Paperclip size={18} />
            </Button> */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              onTouchStart={() => setIsRecording(true)}
              onTouchEnd={() => setIsRecording(false)}
            >
              <Mic size={18} />
            </Button> */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Smile size={18} />
            </Button> */}
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              value={messageBody}
              onChange={(e) => {
                setMessageBody(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="min-h-[48px] max-h-32 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
            />
            {/* Mobile Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1 sm:hidden">
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8 rounded-full text-slate-500"
              >
                <Smile size={16} />
              </Button>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!messageBody.trim() || isSending}
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 p-0 shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <SendHorizontal className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium">
                Enter
              </span>
              to send
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium">
                Shift
              </span>
              +
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium">
                Enter
              </span>
              for new line
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {messageBody.length}/2000
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Report Message</DialogTitle>
            <DialogDescription>
              Our team will review this report within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reason for reporting
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="scam">Scam or fraud</option>
                <option value="harassment">Harassment</option>
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Additional details
              </label>
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Please provide any additional context..."
                className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setReportOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReport}
                disabled={isReporting}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500"
              >
                {isReporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to your global CSS */}
      <style jsx global>{`
        @keyframes typing-dot {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }

        .animate-typing-dot {
          animation: typing-dot 1.4s ease-in-out infinite;
        }

        .animation-delay-150 {
          animation-delay: 0.15s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        @media (max-width: 640px) {
          .scrollbar-thin {
            scrollbar-width: none;
          }
          .scrollbar-thin::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
