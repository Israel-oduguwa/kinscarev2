"use client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createFlow,
  handleQuickReply as flowHandleQuickReply,
  handleText as flowHandleText,
} from "./kinscareFlow";
import Image from "next/image";
import axios from "axios";
import ExplorerSignup from "@/Caregivers/UiProviders/ExplorerSignup";
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@clerk/nextjs";
// NEW: bring in your auth/user context

/**
 * KinsCare Chat Widget UI (Responsive + Smooth)
 * ---------------------------------------------
 * • Full-screen on small screens; compact floating card on md+
 * • Bottom-right anchored on desktop; never reaches the top
 * • Smooth "thinking" experience: typing indicator + staggered pop-in
 * • Pretty pill buttons; optional href support opens in new tab .
 */

export type ChatMsg = {
  id: string;
  from: "bot" | "user";
  text: string;
  time?: string;
  quickReplies?: { id: string; label: string; href?: string }[];
};

// SVG icons
function IconMessage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconMinus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14" />
    </svg>
  );
}
function IconSend(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
  );
}
function IconSparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 3v4M3 5h4" />
      <path d="M19 14v4M17 16h4" />
      <path d="M11 7l1.7 3.3L16 12l-3.3 1.7L11 17l-1.7-3.3L6 12l3.3-1.7L11 7z" />
    </svg>
  );
}

export default function ChatWidgetUI() {
  // NEW: read sign-in state from your app
  const { userData }: any = useAuthContext();
  const { isSignedIn } = useAuth();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [allowFreeText, setAllowFreeText] = useState(false);

  // NEW: Signup modal state
  const [showSignup, setShowSignup] = useState(false);

  const flowStateRef = useRef<ReturnType<typeof createFlow>["state"] | null>(
    null
  );
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const enqueueLock = useRef<Promise<void>>(Promise.resolve()); // serialize UI enqueues

  // Smooth scroll to bottom on updates
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, showTyping, open, minimized, showSignup]);

  // Initialize flow when widget opens — using current signed-in status
  useEffect(() => {
    if (open && !flowStateRef.current) {
      const { state, ui } = createFlow({ userSignedIn: isSignedIn }); // NEW
      flowStateRef.current = state;
      enqueueFrame(ui);
    }
    if (!open) {
      setShowTyping(false);
    }
  }, [open, isSignedIn]); // NEW: re-evaluate when sign-in changes and panel (re)opens

  // Keep FSM in sync when user signs in/out mid-conversation (no transcript loss)
  useEffect(() => {
    if (!flowStateRef.current) return;
    // update the flag inside the FSM session
    if (flowStateRef.current.session.user_signed_in !== isSignedIn) {
      flowStateRef.current.session.user_signed_in = isSignedIn;

      // optional: gently inform the user without restarting
      enqueueFrame({
        messages: [
          {
            id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            from: "bot",
            text: isSignedIn
              ? "You're signed in. Ready to proceed?"
              : "You're signed out.",
            time: "now",
          },
        ],
        allowFreeText: allowFreeText, // keep current input mode
      });
    }
  }, [isSignedIn]); // NEW

  // —— UI enqueue helpers for smooth "thinking" feel ——
  const baseThink = 950; // ms before first bot message
  const betweenMsgs = 120; // ms gap between multiple bot messages

  function appendUserBubble(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        from: "user",
        text,
        time: "now",
      },
    ]);
  }

  function enqueueFrame(ui: { messages: ChatMsg[]; allowFreeText: boolean }) {
    // Chain after the last enqueue to avoid overlap
    enqueueLock.current = enqueueLock.current.then(async () => {
      // Show typing only if there is at least one bot message arriving
      const hasBot = ui.messages.some((m) => m.from === "bot");
      if (hasBot) setShowTyping(true);

      await wait(baseThink);

      // Stagger bot messages for a natural feel
      for (let i = 0; i < ui.messages.length; i++) {
        setMessages((prev) => [...prev, ui.messages[i]]);
        await wait(betweenMsgs);
      }

      setShowTyping(false);
      setAllowFreeText(ui.allowFreeText);
    });
  }

  async function onQuickReplyClick(
    label: string,
    href?: string,
    idMaybe?: string
  ) {
    const id = idMaybe ?? label;

    // Intercept: SIGN UP — call college API, store, open ExplorerSignup
    if (id === "trigger_signup") {
      const programOrReco =
        flowStateRef.current?.session?.recommendation ||
        flowStateRef.current?.session?.program;

      try {
        if (programOrReco) {
          const { data: collegeRecommendation } = await axios.post(
            "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/ai/college-recommendation/",
            { program: programOrReco },
            { headers: { "Content-Type": "application/json" } }
          );
          const aiRecommendation = {
            recommendationPhrase: programOrReco,
            ...collegeRecommendation,
            saved_at: new Date().toISOString(),
          };
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "ai_recommendation",
              JSON.stringify(aiRecommendation)
            );
          }
        }
      } catch {
        // non-fatal; proceed to open signup anyway
      }

      setShowSignup(true);
      // small feedback bubble
      setMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          from: "bot",
          text: "Launching signup…",
          time: "now",
        },
      ]);
      return; // don't forward to flow; UI owns this action
    }

    // Handle hard UI controls locally
    if (id === "exit") {
      // Close and reset conversation
      setOpen(false);
      flowStateRef.current = null;
      setMessages([]);
      setInputText("");
      setAllowFreeText(false);
      setShowTyping(false);
      setShowSignup(false);
      return;
    }
    if (id === "restart") {
      // Clear transcript + flow state, then re-init welcome
      flowStateRef.current = null;
      setMessages([]);
      setInputText("");
      setAllowFreeText(false);
      setShowTyping(false);
      setShowSignup(false);
      const { state, ui } = createFlow({ userSignedIn: isSignedIn }); // NEW: preserve current sign-in
      flowStateRef.current = state;
      enqueueFrame(ui);
      return;
    }

    if (href) {
      try {
        window.open(href, "_blank", "noopener,noreferrer");
      } catch {}
    }
    if (!flowStateRef.current) return;

    appendUserBubble(label);

    const { state, ui } = await flowHandleQuickReply(flowStateRef.current, {
      id,
    });
    flowStateRef.current = state;
    enqueueFrame(ui);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !flowStateRef.current) return;
    const value = inputText.trim();
    setInputText("");
    appendUserBubble(value);

    const { state, ui } = await flowHandleText(flowStateRef.current, value);
    flowStateRef.current = state;
    enqueueFrame(ui);
  }

  // Memo CSS class for pretty pill buttons
  const buttonClass = useMemo(
    () =>
      "px-3 py-1.5 rounded-full text-sm font-medium transition border shadow-xl " +
      "bg-neutral-900 text-white border-neutral-900 hover:opacity-90 " +
      "dark:bg-white dark:text-neutral-900 dark:border-white",
    []
  );

  return (
    <>
      {/* Keyframes + viewport helpers */}
      <style>{`
  @keyframes cwDot { 0%{opacity:.35} 50%{opacity:1} 100%{opacity:.35} }
  @keyframes cwIn {
    from { opacity: 0; transform: translateY(14px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .cw-thread { scrollbar-gutter: stable; -webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior: contain; }
  .cw-pop { animation: cwPop .26s cubic-bezier(.2,.8,.2,1) both; }
  @keyframes cwPop { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @supports (height: 100svh) { .cw-hs { height: 85svh; } }
`}</style>

      {/* Floating Launcher */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setMinimized(false);
        }}
        className="fixed z-[60] bottom-6 right-6 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/70 focus:outline-none transition-all duration-300 hover:scale-110 group"
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open KinsCare AI chat"}
      >
        {/* Background shimmer effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Main icon with animation */}
        <div className="relative z-10">
          <IconMessage
            width={28}
            height={28}
            fill="#ffff"
            className="transition-transform duration-300 group-hover:scale-110"
          />

          {/* Pulsing ring effect */}
          <span className="absolute inset-0 -m-2 rounded-full bg-blue-400 animate-ping opacity-15 group-hover:opacity-100 duration-300 -z-10"></span>
        </div>

        {/* Optional status indicator when open */}
        {open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>
      {/* Panel */}
      {open && (
        <>
          {/* Backdrop (blur + dim, click-through so page scroll still works) */}
          <div
            className={[
              "fixed inset-0 z-[65] pointer-events-none",
              "backdrop-blur-sm bg-neutral-900/20 md:bg-neutral-900/20",
              "transition-opacity duration-300 opacity-100",
            ].join(" ")}
          />

          <aside
            role="dialog"
            aria-modal="true"
            className={[
              "fixed z-[700] sha  overflow-hidden flex flex-col min-h-0 bg-white dark:bg-neutral-900",
              "bg-white/85 dark:bg-neutral-900/80 backdrop-blur-md",
              "inset-0 w-screen h-[100dvh] cw-hs max-w-none rounded-none border-0",
              "md:inset-auto md:top-auto md:right-5 md:bottom-20 md:w-full md:max-w-[27.5rem] md:h-[560px] md:rounded-2xl md:border md:border-neutral-200 md:dark:border-neutral-800 md:shadow-2xl md:shadow-blue-50",
              "md:rounded-3xl md:shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:ring-1 md:ring-black/10 md:dark:ring-white/10",
            ].join(" ")}
            style={{ animation: "cwIn .24s cubic-bezier(.2,.8,.2,1) both" }}
          >
            {/* Header */}
            <div
              className="h-14 px-4 pt-[env(safe-area-inset-top)] flex items-center justify-between
  border-b border-gray-200 dark:border-white/10
  bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-md ring-1 ring-white/50 dark:ring-black/40">
                    <Image
                      src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                      alt="KinsCare Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Online status dot (optional) */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
                </div>

                <div className="leading-tight">
                  <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-50">
                    KinsCare Assistant
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Online · typically replies in seconds
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* <button
                title={minimized ? "Expand" : "Minimize"}
                onClick={() => setMinimized((v) => !v)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <IconMinus width={16} height={16} />
              </button> */}
                <button
                  title="Close"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <IconX width={16} height={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className={
                "flex-1 flex flex-col min-h-0 " +
                (minimized ? "opacity-40 pointer-events-none" : "")
              }
            >
              {/* Thread */}
              <div
                ref={scrollerRef}
                className="cw-thread flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3 bg-neutral-50/60 dark:bg-neutral-950/40"
              >
                {messages.map((m) => (
                  <Bubble
                    key={m.id}
                    msg={m}
                    onQuickReply={onQuickReplyClick}
                    buttonClass={buttonClass}
                  />
                ))}
                {showTyping && <TypingBubble />}
              </div>

              {/* Composer */}
              <form
                onSubmit={onSubmit}
                className="h-16 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 pb-[env(safe-area-inset-bottom)]"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={!allowFreeText}
                    placeholder={
                      allowFreeText
                        ? "Type your message…"
                        : "Please choose an option above"
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none disabled:opacity-40"
                  />
                  <button
                    disabled={!allowFreeText || !inputText.trim()}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white disabled:opacity-40"
                  >
                    <IconSend width={16} height={16} />
                  </button>
                </div>
              </form>
            </div>
          </aside>

          {/* Signup Modal */}
          {showSignup && (
            <div className="fixed inset-0 z-[800] flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowSignup(false)}
              />
              <div className="relative z-[801] max-w-lg max-h-[85vh] overflow-auto rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 p-6">
                {/* Close button */}
                <button
                  onClick={() => setShowSignup(false)}
                  className="absolute top-2 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  aria-label="Close signup"
                >
                  <IconX width={16} height={16} />
                </button>
                <ExplorerSignup setChat={setOpen} setDialog={setShowSignup} />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Bubble({
  msg,
  onQuickReply,
  buttonClass,
}: {
  msg: ChatMsg;
  onQuickReply: (label: string, href?: string, idMaybe?: string) => void;
  buttonClass: string;
}) {
  const isBot = msg.from === "bot";
  return (
    <div className={"flex cw-pop " + (isBot ? "justify-start" : "justify-end")}>
      <div
        className={
          (isBot
            ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200/70 dark:border-neutral-800/70"
            : "bg-black text-white") +
          " max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm"
        }
      >
        <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
        {!!msg.quickReplies?.length && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.quickReplies.map((q) => (
              <button
                key={q.id ?? q.label}
                onClick={() => onQuickReply(q.label, q.href, q.id)}
                className={buttonClass}
                type="button"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start cw-pop">
      <div className="bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-800/70 max-w-[82%] rounded-2xl px-3 py-2 text=[13px] leading-relaxed shadow-sm">
        <div className="inline-flex items-center gap-2">
          <span className="text-neutral-500 text-xs">Assistant is typing</span>
          <span className="inline-flex items-center gap-1 text-neutral-500">
            <i
              className="w-1.5 h-1.5 rounded-full bg-current opacity-50"
              style={{ animation: "cwDot 1s infinite" }}
            />
            <i
              className="w-1.5 h-1.5 rounded-full bg-current opacity-50"
              style={{ animation: "cwDot 1s infinite .2s" }}
            />
            <i
              className="w-1.5 h-1.5 rounded-full bg-current opacity-50"
              style={{ animation: "cwDot 1s infinite .4s" }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}
