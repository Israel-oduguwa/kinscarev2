"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/hooks/useApiClient";
import VerifyAccount from "./VerifyAccount";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CaregiverPayload = {
  id: string;
  fname?: string;
  lname?: string;
  profileImage?: string | null;
  phone?: string | null;
};

type StartConversationButtonProps = {
  caregiver: CaregiverPayload;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
};

const buildName = (fname?: string, lname?: string) => {
  return [fname, lname].filter(Boolean).join(" ").trim();
};

const normalizePhone = (phone?: string | null) => {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  return `+${digits}`;
};

export default function StartConversationButton({
  caregiver,
  className,
  variant = "default",
  size = "default",
  fullWidth = false,
}: StartConversationButtonProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { userData } = useAuthContext();
  const { privateApi } = useApiClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [existingConversationSid, setExistingConversationSid] = useState<
    string | null
  >(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [flowState, setFlowState] = useState<
    "compose" | "sending" | "payment_required"
  >("compose");
  const [accessInfo, setAccessInfo] = useState<{
    trialActive?: boolean;
    subscriptionActive?: boolean;
    paymentVerified?: boolean;
  } | null>(null);

  const providerId = userData?.userID;
  const providerName =
    buildName(userData?.fname, userData?.lname) || userData?.name || "Provider";
  const providerPhone =
    userData?.settings?.tel || userData?.tel || userData?.phone || null;
  const caregiverName = useMemo(
    () => buildName(caregiver.fname, caregiver.lname) || "Caregiver",
    [caregiver.fname, caregiver.lname]
  );
  const caregiverFirstName = caregiver.fname || caregiverName.split(" ")[0];

  const defaultMessage = useMemo(() => {
    return `I came across your profile and would love to connect about a caregiving opportunity that matches your experience.`;
  }, []);

  const buildSmsBody = (
    note: string,
    link: string | null,
    includeLink: boolean
  ) => {
    const intro = `Hi ${caregiverFirstName}, it’s ${providerName} from Kinscare.`;
    const warmNote = note.trim() || defaultMessage;
    const linkLine = includeLink && link ? `Reply here: ${link}` : "";
    const closing = includeLink
      ? "Looking forward to connecting."
      : "I’ll follow up soon on Kinscare.";
    return [intro, warmNote, linkLine, closing].filter(Boolean).join(" ");
  };

  const handlePaymentRequired = async (
    access: {
      trialActive?: boolean;
      subscriptionActive?: boolean;
      paymentVerified?: boolean;
    },
    smsBody: string,
    toNumber: string
  ) => {
    setAccessInfo(access);
    toast.error(
      "Provider must be on free trial or paid to start a conversation."
    );
    await privateApi.post("/api/sms", {
      to: toNumber,
      body: smsBody,
    });
    setFlowState("payment_required");
    if (!access.trialActive && !access.subscriptionActive && !access.paymentVerified) {
      setVerifyOpen(true);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!providerId || !caregiver?.id) return;

    const checkExisting = async () => {
      setIsChecking(true);
      try {
        const { data } = await privateApi.get("/api/conversations/exists", {
          params: { providerId, caregiverId: caregiver.id },
        });
        if (data?.success && data?.exists) {
          setExistingConversationSid(data?.data?.conversationSid || null);
        } else {
          setExistingConversationSid(null);
        }
      } catch (_error) {
        setExistingConversationSid(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkExisting();
  }, [caregiver?.id, isLoaded, isSignedIn, privateApi, providerId]);

  const handleStart = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      toast.error("Please sign in to start a conversation.");
      return;
    }

    if (!userData?.complete) {
      toast.error("Complete your profile to start messaging.");
      router.push("/provider/account/settings/profile");
      return;
    }

    if (userData?.role && userData.role !== "provider") {
      toast.error("Only providers can start a conversation.");
      return;
    }

    if (!providerId || !caregiver?.id) {
      toast.error("Missing user information for chat.");
      return;
    }

    if (!providerPhone || !caregiver.phone) {
      toast.error("Both users must have a phone number on file.");
      return;
    }

    if (existingConversationSid) {
      router.push(`/provider/conversations/${existingConversationSid}`);
      return;
    }

    setDraftMessage(defaultMessage);
    setFlowState("compose");
    setDialogOpen(true);
  };

  const handleSend = async () => {
    if (!providerId || !caregiver?.id) return;
    if (!providerPhone || !caregiver.phone) {
      toast.error("Both users must have a phone number on file.");
      return;
    }

    const toNumber = normalizePhone(caregiver.phone);
    if (!toNumber) {
      toast.error("Caregiver phone number is invalid.");
      return;
    }

    let paymentBlocked = false;
    setIsLoading(true);
    setFlowState("sending");
    setAccessInfo(null);
    try {
      const { data } = await privateApi.post("/api/conversations/ensure", {
        provider: {
          id: providerId,
          name: providerName,
          avatar: user?.imageUrl || null,
          phone: providerPhone,
        },
        caregiver: {
          id: caregiver.id,
          name: caregiverName,
          avatar: caregiver.profileImage || null,
          phone: caregiver.phone,
        },
      });

      if (!data?.success) {
        if (data?.code === "PAYMENT_REQUIRED") {
          paymentBlocked = true;
          const smsBody = buildSmsBody(draftMessage, null, false);
          await handlePaymentRequired(data?.access || {}, smsBody, toNumber);
          return;
        }
        throw new Error(data?.message || "Unable to start conversation.");
      }

      const sid = data?.data?.conversationSid;
      if (!sid) {
        throw new Error("Conversation SID missing.");
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const replyLink = `${origin}/vitae/conversations/${sid}`;
      const smsBody = buildSmsBody(draftMessage, replyLink, true);
      await privateApi.post("/api/sms", {
        to: toNumber,
        body: smsBody,
      });
      setExistingConversationSid(sid);
      setDialogOpen(false);
      router.push(`/provider/conversations/${sid}`);
    } catch (error: any) {
      const responseData = error?.response?.data;
      if (responseData?.code === "PAYMENT_REQUIRED") {
        paymentBlocked = true;
        const smsBody = buildSmsBody(draftMessage, null, false);
        await handlePaymentRequired(responseData?.access || {}, smsBody, toNumber);
        return;
      }
      toast.error(
        responseData?.message || error?.message || "Unable to start conversation."
      );
    } finally {
      setIsLoading(false);
      if (!paymentBlocked) {
        setFlowState("compose");
      }
    }
  };

  return (
    <>
      <Button
        onClick={handleStart}
        disabled={isLoading || isChecking}
        className={`gap-2 ${fullWidth ? "w-full" : ""} ${className || ""}`}
        variant={variant}
        size={size}
      >
        {isLoading || isChecking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        {existingConversationSid ? "Open conversation" : "Start conversation"}
      </Button>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setFlowState("compose");
            setAccessInfo(null);
          } else {
            setDialogOpen(true);
            setDraftMessage(defaultMessage);
            setFlowState("compose");
            setAccessInfo(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Introduce yourself to {caregiverName}</DialogTitle>
            <DialogDescription>
              Send a warm note to start the conversation on Kinscare.
            </DialogDescription>
          </DialogHeader>

          {flowState === "payment_required" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Message sent. To continue chatting, please verify your account
                or subscribe.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {!accessInfo?.paymentVerified ? (
                  <Button onClick={() => setVerifyOpen(true)}>
                    Verify account
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => router.push("/provider/account/settings")}
                >
                  Go to billing
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                rows={5}
                className="resize-none"
                placeholder="Write a friendly intro message..."
              />
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                This message will include a secure Kinscare chat link so the
                caregiver can reply instantly.
              </div>
              <Button
                onClick={handleSend}
                disabled={isLoading || !draftMessage.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Send message & start chat
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <VerifyAccount openModal={verifyOpen} setOpenModal={setVerifyOpen} />
    </>
  );
}
