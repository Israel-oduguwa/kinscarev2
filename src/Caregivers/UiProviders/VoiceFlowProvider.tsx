/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useApiClient } from "@/hooks/useApiClient";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import ExplorerSignup from "./ExplorerSignup";

/** =========================
 *  Config (tweak freely)
 *  ========================= */
const VF_PROJECT_ID = "6717a6c73a30d3122f94d79e";
const VF_VERSION_ID = "6717a6c73a30d3122f94d79f";
const VF_RUNTIME_URL = "https://general-runtime.voiceflow.com";
const VF_SCRIPT_SRC = "https://cdn.voiceflow.com/widget/bundle.mjs";

/** UX rules */
const PROACTIVE_DELAY_MS = 8000; // Wait before nudging
const IDLE_REQUIRED_MS = 6000; // User must be idle this long
const SESSION_SUPPRESS_KEY = "vf_proactive_suppressed_session";
const LAST_SHOWN_KEY = "vf_proactive_last_shown_at";
const ONBOARD_DONE_KEY = "vf_onboarding_completed"; // set this when signup success happens
const COOLDOWN_DAYS = 7;
const MIN_VIEWPORT_WIDTH = 768; // don’t nag on very small screens

/** =========================
 *  Window typing
 *  ========================= */
declare global {
  interface Window {
    voiceflow?: any;
    __KINSCARE_DIALOG_ACTIVE?: boolean;
    __KINSCARE_VF_SCRIPT_ATTACHED__?: boolean;
    __KINSCARE_PROACTIVE_PUSHED__?: boolean;
    __KINSCARE_EVENTS_BOUND__?: boolean;
    global_element?: any;
    selectedPrograms?: any[];
    cardData?: any[];
    renderCarousel?: (payload: any) => Promise<void>;
  }
}

/** =========================
 *  Context
 *  ========================= */
interface VoiceFlowContextProps {
  handleSignupSuccess: () => void;
}
const VoiceFlowContext = createContext<VoiceFlowContextProps | null>(null);
export const useVoiceFlow = () => useContext(VoiceFlowContext);

interface VoiceFlowProviderProps {
  children: ReactNode;
}

/** =========================
 *  Helpers
 *  ========================= */
function daysToMs(d: number) {
  return d * 24 * 60 * 60 * 1000;
}

function now() {
  return Date.now();
}

function canShowProactive(): boolean {
  if (typeof window === "undefined") return false;

  // Don’t show if suppressed for this session
  if (sessionStorage.getItem(SESSION_SUPPRESS_KEY) === "1") return false;

  // Don’t show if user already completed onboarding flow
  if (localStorage.getItem(ONBOARD_DONE_KEY) === "1") return false;

  // Cooldown
  const lastShown = Number(localStorage.getItem(LAST_SHOWN_KEY) || 0);
  if (lastShown && now() - lastShown < daysToMs(COOLDOWN_DAYS)) return false;

  // Avoid tiny screens (banner can feel intrusive)
  if (window.innerWidth < MIN_VIEWPORT_WIDTH) return false;

  // Only if tab is visible
  if (document.visibilityState !== "visible") return false;

  return true;
}

function markProactiveShown() {
  localStorage.setItem(LAST_SHOWN_KEY, String(now()));
  sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
}

function markOnboardingDone() {
  localStorage.setItem(ONBOARD_DONE_KEY, "1");
}

function onIdle(ms: number): Promise<void> {
  return new Promise((resolve) => {
    let last = Date.now();
    let timer: number | null = null;

    const reset = () => {
      last = Date.now();
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(check, ms);
    };

    const check = () => {
      if (Date.now() - last >= ms) {
        cleanup();
        resolve();
      } else {
        reset();
      }
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "wheel"];
    const visHandler = () => {
      if (document.visibilityState === "visible") reset();
    };

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset, { passive: true } as any));
      document.removeEventListener("visibilitychange", visHandler);
    };

    events.forEach((e) => window.addEventListener(e, reset, { passive: true } as any));
    document.addEventListener("visibilitychange", visHandler);

    reset();
  });
}

function closeVoiceflowWidget() {
  if (
    typeof window !== "undefined" &&
    window.voiceflow?.chat &&
    typeof window.voiceflow.chat.close === "function"
  ) {
    window.voiceflow.chat.close();
  }
  const vfIframe = document.querySelector<HTMLIFrameElement>('iframe[src*="voiceflow.com"]');
  if (vfIframe) vfIframe.style.display = "none";
}

function showVoiceflowWidget() {
  const vfIframe = document.querySelector<HTMLIFrameElement>('iframe[src*="voiceflow.com"]');
  if (vfIframe) vfIframe.style.display = "block";
}

/** =========================
 *  Component
 *  ========================= */
const VoiceFlowProvider: React.FC<VoiceFlowProviderProps> = ({ children }) => {
  const {
    userData,
  }: any = useAuthContext();

  const userID = userData?.userID as string | number | undefined;
  const router = useRouter();

  const [dialog, setDialog] = useState<boolean>(false);

  /** Toast error handler */
  const handleError = (error: any) => {
    console.error("Voiceflow error:", error);
    toast({
      variant: "destructive",
      className: cn("top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"),
      description: error?.message || "An error occurred. Please try again.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  /** Load VF script once */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userData?.role === "provider") return; // Respect providers (no widget)

    // Prevent double attaching the script
    if (window.__KINSCARE_VF_SCRIPT_ATTACHED__) return;
    window.__KINSCARE_VF_SCRIPT_ATTACHED__ = true;

    // Prepare globals for your extension
    window.global_element = null;
    window.selectedPrograms = [];
    window.cardData = [];
    window.__KINSCARE_DIALOG_ACTIVE = false;

    const scriptId = "kinscare-vf-script";
    if (document.getElementById(scriptId)) return;

    const v = document.createElement("script");
    v.id = scriptId;
    v.src = VF_SCRIPT_SRC;
    v.type = "text/javascript";

    v.onload = () => {
      // Once bundle is ready, load chat
      initVoiceflow()
        .then(bindUXGuards)
        .catch(handleError);
    };

    v.onerror = () => {
      console.error("Failed to load Voiceflow script");
    };

    // Insert before first script to avoid blocking
    const s = document.getElementsByTagName("script")[0];
    s?.parentNode?.insertBefore(v, s);

    // Cleanup if component unmounts
    return () => {
      // We purposely don’t remove the script to allow reuse across pages
    };
    // eslint-disable-next-line
  }, [userData?.role]);

  /** Avoid showing proactive while navigating (non-blocking) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleRoute = () => {
      // Suppress for this session after route changes to avoid popping over new screens
      sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
    };
    // We don’t have router events in App Router easily; using visibility and a small timer instead.
    const visHandler = () => {
      if (document.visibilityState !== "visible") {
        sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
      }
    };
    document.addEventListener("visibilitychange", visHandler);
    return () => {
      document.removeEventListener("visibilitychange", visHandler);
    };
  }, []);

  /** Initialize VF and register extension */
  const initVoiceflow = async () => {
    if (!window.voiceflow?.chat?.load) {
      // Voiceflow attaches a global "voiceflow" with .chat.load
      // If not present, bail quietly.
      return;
    }

    // Custom extension that triggers your ExplorerSignup dialog
    const FormExtension = {
      name: "Forms",
      type: "response",
      match: ({ trace }: any) =>
        trace?.type === "Custom_Form" || trace?.payload?.name === "Custom_Form",
      render: async ({ trace, element }: any) => {
        window.global_element = element;
        const payload = trace?.payload || {};

        // If a dialog is already open, do nothing
        if (window.__KINSCARE_DIALOG_ACTIVE) return;

        // Open your dialog and hide VF while user completes it
        window.__KINSCARE_DIALOG_ACTIVE = true;
        closeVoiceflowWidget();
        setDialog(true);

        // Fetch recommendation in the background (non-blocking)
        try {
          const recommendation = payload?.recommendation ?? payload?.program ?? "";
          if (recommendation) {
            const { data: collegeRecommendation } = await privateApi.post(
              `/api/v1/ai/college-recommendation/`,
              { program: recommendation }
            );
            const aiRecommendation = {
              recommendationPhrase: recommendation,
              ...collegeRecommendation,
              saved_at: new Date().toISOString(),
            };
            localStorage.setItem("ai_recommendation", JSON.stringify(aiRecommendation));
          }
        } catch (err) {
          handleError(err);
        }

        // Let VF know we’re handling it
        try {
          await window.voiceflow.chat.interact({
            type: "complete",
            payload: { college_selected: payload?.program ?? "" },
          });
        } catch (e) {
          // Non-fatal
        }
      },
    };

    await window.voiceflow.chat
      .load({
        verify: { projectID: VF_PROJECT_ID },
        url: VF_RUNTIME_URL,
        versionID: VF_VERSION_ID,
        userID: userID || "",
        assistant: {
          type: "chat",
          renderMode: "popover", // 'embed' | 'popover'
          extensions: [FormExtension],
        },
      })
      .then(() => {
        // Don’t proactively push immediately—let bindUXGuards decide smartly
      });
  };

  /** Bind behavior that prevents blocking UX */
  const bindUXGuards = async () => {
    if (!window.voiceflow?.chat) return;
    if (window.__KINSCARE_EVENTS_BOUND__) return; // ensure single bind
    window.__KINSCARE_EVENTS_BOUND__ = true;

    const chat = window.voiceflow.chat;

    // As soon as the user sends *anything*, clear any proactive content so it doesn't linger
    const onSend = () => {
      try {
        if (chat.proactive?.clear) chat.proactive.clear();
      } catch {}
      // After they interact, suppress proactive for the session
      sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
    };

    // If user manually closes, also avoid re-nudging this session
    const onClose = () => {
      sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
    };

    // Keep the iframe visible state in sync when opened/closed
    const onOpen = () => {
      showVoiceflowWidget();
    };

    chat.on?.("send", onSend);
    chat.on?.("close", onClose);
    chat.on?.("open", onOpen);

    // Schedule a *smart* proactive nudge
    scheduleProactiveNudge();
  };

  /** Smart proactive: only if allowed, after delay + idle */
  const scheduleProactiveNudge = async () => {
    if (!canShowProactive()) return;
    if (window.__KINSCARE_DIALOG_ACTIVE) return;

    // wait a bit so we don't interrupt immediate actions
    await new Promise((r) => setTimeout(r, PROACTIVE_DELAY_MS));

    // only when user has been idle (reduces “blocking” feel)
    await onIdle(IDLE_REQUIRED_MS);

    // re-check conditions before pushing
    if (!canShowProactive() || window.__KINSCARE_DIALOG_ACTIVE) return;
    if (!window.voiceflow?.chat?.proactive?.push) return;

    try {
      window.voiceflow.chat.proactive.push(
        {
          type: "text",
          payload: {
            message:
              "👋 Hi there! I’m your KinsCare assistant. I can help you explore programs or find caregivers when you’re ready.",
          },
        },
        {
          type: "text",
          payload: {
            message: "No rush—ask me anything or just keep browsing.",
          },
        }
      );
      // Mark to enforce cooldown + session suppression
      markProactiveShown();

      // If the user types anything next, it gets cleared by the send handler.
      window.__KINSCARE_PROACTIVE_PUSHED__ = true;
    } catch {
      // Ignore errors—no need to toast for a gentle nudge
    }
  };

  /** Signup success from ExplorerSignup */
  const handleSignupSuccess = () => {
    // Mark onboarding so we don't proactively nag again
    markOnboardingDone();

    // Close your dialog, allow VF to reappear gently
    setDialog(false);
    window.__KINSCARE_DIALOG_ACTIVE = false;

    // Give a tiny breather before showing widget again
    setTimeout(() => showVoiceflowWidget(), 300);
  };

  /** Reset guard if the dialog closes via other means */
  useEffect(() => {
    if (!dialog) {
      window.__KINSCARE_DIALOG_ACTIVE = false;
    }
  }, [dialog]);

  return (
    <VoiceFlowContext.Provider value={{ handleSignupSuccess }}>
      {/* Dialog Overlay */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-xl transition-opacity duration-500"
            style={{ pointerEvents: "none", opacity: dialog ? 1 : 0 }}
            aria-hidden="true"
          />
          <div
            className={`
              relative z-10 max-w-lg w-full
              rounded-3xl p-8 overflow-hidden
              bg-white
              border border-white/40
              backdrop-blur-2xl
              shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${dialog ? "opacity-100 scale-100" : "opacity-0 scale-90"}
            `}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-fuchsia-600 to-indigo-500" />
            <ExplorerSignup setDialog={setDialog} />
          </div>
        </div>
      )}
      {children}
    </VoiceFlowContext.Provider>
  );
};

export default VoiceFlowProvider;
