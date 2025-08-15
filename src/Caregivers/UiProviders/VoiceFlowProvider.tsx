/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import MongoContext from "@/app/MongoContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import ExplorerSignup from "./ExplorerSignup";

interface VoiceFlowContextProps {
  handleSignupSuccess: () => void;
}

const VoiceFlowContext = createContext<VoiceFlowContextProps | null>(null);

export const useVoiceFlow = () => useContext(VoiceFlowContext);

interface VoiceFlowProviderProps {
  children: ReactNode;
}

// Utility: Hide/Show Voiceflow Widget
function closeVoiceflowWidget() {
  if (
    typeof window !== "undefined" &&
    (window as any).voiceflow &&
    (window as any).voiceflow.chat &&
    typeof (window as any).voiceflow.chat.close === "function"
  ) {
    (window as any).voiceflow.chat.close();
  }
  const vfIframe = document.querySelector<HTMLIFrameElement>(
    'iframe[src*="voiceflow.com"]'
  );
  if (vfIframe) vfIframe.style.display = "none";
}

function showVoiceflowWidget() {
  const vfIframe = document.querySelector<HTMLIFrameElement>(
    'iframe[src*="voiceflow.com"]'
  );
  if (vfIframe) vfIframe.style.display = "block";
}

const VoiceFlowProvider: React.FC<VoiceFlowProviderProps> = ({ children }) => {
  // MongoContext types (adjust as per your app)
  const {
    app,
    client,
    user,
    userData,
    setUser,
    setUserData,
    setAuthenticated,
    loadingAuth,
    authenticated,
  }: any = useContext(MongoContext);

  const userID = userData?.userID as string | number | undefined;
  const { push } = useRouter();

  const [dialog, setDialog] = useState<boolean>(false);
  const [canClose, setCanClose] = useState<boolean>(false);

  // Toast error handler
  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    toast({
      variant: "destructive",
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
      ),
      description: error?.message || "An error occurred. Please try again.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
  };

  // Load Voiceflow Widget & Extensions
  useEffect(() => {
    if (userData && userData.role === "provider") {
      // do nothing
    } else {
      (function (d: Document, t: string) {
        const v = d.createElement(t);
        const s = d.getElementsByTagName(t)[0];
        v.onload = function () {
          // @ts-ignore
          window.global_element = null;
          // @ts-ignore
          window.selectedPrograms = [];
          // @ts-ignore
          window.cardData = [];
          const myUserID = userID || 121;
      
          // Prevent dialog flicker/duplicate
          (window as any).__KINSCARE_DIALOG_ACTIVE = false;
      
          // @ts-ignore
          window.renderCarousel = async function (payload: any) {
            const { program, recommendation, career_path } = payload;
            console.log(recommendation, payload);
            if (!(window as any).__KINSCARE_DIALOG_ACTIVE) {
              (window as any).__KINSCARE_DIALOG_ACTIVE = true;
              closeVoiceflowWidget();
              setDialog(true);
              setCanClose(false);
              console.log(recommendation)
              try {
                const { data: collegeRecommendation } = await axios.post(
                  `https://kinscare-backend.onrender.com/api/v1/ai/college-recommendation/`,
                  { program: recommendation }
                );
                const aiRecommendation = {
                  recommendationPhrase: recommendation,
                  ...collegeRecommendation,
                  saved_at: new Date().toISOString(),
                };
                localStorage.setItem(
                  "ai_recommendation",
                  JSON.stringify(aiRecommendation)
                );
              } catch (err) {
                console.log(err)
                handleError(err);
              }
            }
          };
      
          const FormExtension = {
            name: "Forms",
            type: "response",
            match: ({ trace }: any) =>
              trace.type === "Custom_Form" ||
              trace.payload.name === "Custom_Form",
            render: ({ trace, element }: any) => {
              // @ts-ignore
              window.global_element = element;
              const payload = trace.payload || {};
              // @ts-ignore
              window.renderCarousel(payload);
              // @ts-ignore
              window.voiceflow.chat.interact({
                type: "complete",
                payload: {
                  college_selected: payload.program,
                },
              });
            },
          };
      
          // @ts-ignore
          window.voiceflow.chat.load({
            verify: {
              projectID: "6717a6c73a30d3122f94d79e",
            },
            url: "https://general-runtime.voiceflow.com",
            versionID:"6717a6c73a30d3122f94d79f",
            userID: userData?.userID ? userData?.userID : "",
            assistant: {
              type: 'chat',
              renderMode: 'popover', // also accepts 'embed' or 'popover'          
              extensions: [FormExtension],
            },
          }).then(() => {
            window.voiceflow.chat.proactive.push(
              {
                type: 'text',
                payload: {
                  message: "👋 Hi there! I’m your KinsCare assistant, ready to help you find the right caregiver or program."
                }
              },
              {
                type: 'text',
                payload: {
                  message: "What brings you to KinsCare today? Tap below to get started 👇"
                }
              }
            );
      
            // // 👇👇👇 *** Add this to automatically clear proactive message ***
            // window.voiceflow.chat.on('send', () => {
            //   if (window.voiceflow.chat.proactive) {
            //     window.voiceflow.chat.proactive.clear();
            //   }
            // });
            // // 👆👆👆 *** End: Auto-clear proactive on user input ***
          });
        };
        // @ts-ignore
        v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
        // @ts-ignore
        v.type = "text/javascript";
        // @ts-ignore
        s.parentNode?.insertBefore(v, s);
      })(document, "script");
      
    }
    // eslint-disable-next-line
  }, [userID]);

  // Signup success handler
  const handleSignupSuccess = () => {
    setCanClose(true);
    setDialog(false);
    (window as any).__KINSCARE_DIALOG_ACTIVE = false;
    setTimeout(() => showVoiceflowWidget(), 300);
  };

  // On dialog close, reset global flag
  useEffect(() => {
    if (!dialog) {
      (window as any).__KINSCARE_DIALOG_ACTIVE = false;
    }
  }, [dialog]);

  return (
    <VoiceFlowContext.Provider value={{ handleSignupSuccess }}>
      {/* Dialog Overlay */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-xl transition-opacity duration-500"
            style={{
              pointerEvents: "none",
              opacity: dialog ? 1 : 0,
            }}
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
