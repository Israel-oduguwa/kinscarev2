"use client";

import { useAuthContext } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Phone,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";
import { useApiClient } from "@/hooks/useApiClient";

const TWILIO_BASE =
  "http://localhost:8081/api/v1/twilio";

const AGENT_SCRIPTS = [
  {
    id: "text-no-answer",
    title: "Short Text Message (If No Answer)",
    body:
      "Hi, this is [Your Name] from KinsCare.\n" +
      "I'm reaching out because you're looking for a caregiver. We help providers get in front of available caregivers quickly.\n\n" +
      "I'll try you again, or you can call/text me back at [Your Number] when it's convenient.",
  },
  {
    id: "voicemail-30-35",
    title: "Voicemail Script (30-35 seconds)",
    body:
      "Hi, this is [Your Name] calling from KinsCare.\n\n" +
      "I'm reaching out because you're currently looking for a caregiver, or were recently. We help providers get visible to caregivers who are actively looking by making it easy to post a job and review local caregivers.\n\n" +
      "I was hoping to take just 5 minutes to see if we can help speed things up for you.\n\n" +
      "You can call or text me back at [Your Number].\n" +
      "Again, this is [Your Name] with KinsCare. Thank you.",
  },
];

function formatTel(raw?: string | null) {
  if (!raw) return "—";
  const s = raw.startsWith("+") ? raw : `+${raw}`;
  return s;
}

function fmtDate(d?: string | Date | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function formatEventType(value?: string | null) {
  if (!value) return "Event";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatFlowState(value?: string | null) {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizePayload(payload?: Record<string, any> | null) {
  if (!payload) return null;
  const entries = Object.entries(payload).filter(([key, v]) => {
    if (v === undefined || v === null || v === "") return false;
    const keyLower = key.toLowerCase();
    if (keyLower.includes("id")) return false;
    return true;
  });
  if (!entries.length) return null;
  return entries
    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${String(value)}`)
    .join(" · ");
}

function formatActor(actor?: {
  type?: string;
  id?: string;
  channel?: string;
} | null) {
  if (!actor) return "System";
  const typeRaw = actor.type ? actor.type.replace(/_/g, " ") : "System";
  const type =
    typeRaw.toLowerCase() === "agent"
      ? "Agent"
      : typeRaw.toLowerCase() === "provider"
      ? "Provider"
      : typeRaw.toLowerCase() === "caregiver"
      ? "Caregiver"
      : "System";
  const channel =
    actor.channel && actor.channel !== "internal"
      ? ` via ${actor.channel.toUpperCase()}`
      : "";
  return `${type}${channel}`;
}

function buildEventSummary(event?: any) {
  if (!event) return { label: "Activity updated", detail: "" };
  const eventType = event.eventType as string | undefined;
  const payload = (event.payload || {}) as Record<string, any>;

  if (eventType === "FLOW_STATE_CHANGED") {
    const fromState = formatFlowState(payload.from);
    const toState = formatFlowState(payload.to);
    const reason = payload.reason ? String(payload.reason) : "";
    const source = payload.source ? String(payload.source) : "";
    const extra = [reason, source].filter(Boolean).join(" · ");
    return {
      label: `Flow moved from ${fromState} to ${toState}`,
      detail: extra,
    };
  }

  const generic = formatEventType(eventType);
  const reason = payload.reason ? String(payload.reason) : "";
  const source = payload.source ? String(payload.source) : "";
  const detail = [reason, source].filter(Boolean).join(" · ");
  return { label: generic, detail };
}

function getInitials(emailOrName: string) {
  if (!emailOrName) return "?";
  const base = emailOrName.includes("@")
    ? emailOrName.split("@")[0]
    : emailOrName;
  return base.slice(0, 1).toUpperCase();
}

// Safely get string id from ObjectId-like shapes
function toIdString(id: any): string | null {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (typeof id === "object") {
    // Mongo may serialize as { $oid: "..." } or { oid: "..." }
    if (id.$oid) return String(id.$oid);
    if (id.oid) return String(id.oid);
    // Fallback stringify (last resort)
    try {
      return String(id);
    } catch {
      return null;
    }
  }
  return null;
}

export default function TwilioApplicantsDetails() {
  const params = useParams();
  const id = params?.id as string;
  const isUserId = typeof id === "string" && id.startsWith("user_");

 const {userData} = useAuthContext();
  const agentUserId = userData?.userID;

  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [contacted, setContacted] = useState<boolean>(false);
  const [accountCreated, setAccountCreated] = useState<boolean>(false);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [savingContacted, setSavingContacted] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const {privateApi} = useApiClient();

  // SMS dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsCountry, setSmsCountry] = useState("US"); // default; adjust if you want
  const [isSending, setIsSending] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsOk, setSmsOk] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const API_BASE =
    "http://localhost:8081/api/v1/providers";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetJob, setTargetJob] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const onRequestDeleteJob = (job: any) => {
    setTargetJob(job);
    setConfirmOpen(true);
  };

  const onConfirmDeleteJob = async () => {
    if (!targetJob) return;
    setDeleting(true);
    try {
      const jobId = toIdString(
        targetJob.jobId || targetJob._id || targetJob.id
      );
      await privateApi.post(`${API_BASE}/jumpstart/delete-job`, {
        jobId, // stored as ObjectId in snippet
        applicantId: id, // Twilio lead id
        requesterId: agentUserId, // optional auth hint
        force: false, // set true only if you want to allow claimed deletions
      });
      setConfirmOpen(false);
      setTargetJob(null);
      await fetchApplicant(); // refresh list
    } catch (e: any) {
      // optional: surface error
      console.error("Delete job failed:", e?.response?.data || e?.message || e);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyJobLink = async (jobId?: string | null) => {
    if (!jobId) return;
    const link = `https://www.kinscare.org/jobs/${jobId}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Job link copied", {
        description: "Share the link with caregivers to apply.",
      });
    } catch (err: any) {
      toast.error("Copy failed", {
        description: err?.message || "Unable to copy job link.",
      });
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!twilioSignupId) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(paymentLink);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = paymentLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Payment link copied", {
        description: "Share this link with the provider to complete payment.",
      });
    } catch (err: any) {
      toast.error("Copy failed", {
        description: err?.message || "Unable to copy payment link.",
      });
    }
  };

  const handleCopyText = async (text: string, label: string) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Copied", {
        description: `${label} copied to clipboard.`,
      });
    } catch (copyErr: any) {
      toast.error("Copy failed", {
        description: copyErr?.message || "Unable to copy script.",
      });
    }
  };

  const fetchApplicant = async () => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    try {
      const endpoint = `${API_BASE}/jumpstart/flow/${id}`;

      const res = await axios.get(endpoint);

      const payload = res.data?.data || null;
      const flow = payload?.flow || payload || null;
      const data =
        flow && payload
          ? {
              ...flow,
              ...payload,
              agent_jobs: payload?.agent_jobs || flow?.agent_jobs || [],
            }
          : null;
      setApplicant(data);
      setContacted(!!data?.contacted || !!data?.intake?.providerContacted);
      setAccountCreated(
        !!data?.accountCreated || !!data?.intake?.accountCreated
      );
    } catch (e: any) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to load applicant."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id || !applicant) return;
    let cancelled = false;
    const flowId =
      toIdString((applicant as any)?.flowId) ||
      toIdString((applicant as any)?.flow?._id) ||
      toIdString(applicant?._id) ||
      id;

    const fetchEvents = async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const res = await privateApi.get(
          `${API_BASE}/jumpstart/flow/${flowId}/events`,
          { params: { page: 1, limit: 50 } }
        );
        const payload = res?.data || {};
        const data = payload.data || payload.events || [];
        if (!cancelled) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setEventsError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load events."
          );
        }
      } finally {
        if (!cancelled) {
          setEventsLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [id, applicant, privateApi, API_BASE]);

  const email =
    applicant?.primaryContact?.email ?? applicant?.email ?? "—";

  const zipcode = applicant?.intake?.zipcode ?? applicant?.zipcode ?? "—";
  const twilioSignupId =
    applicant?.intake?.twilioSignupId ||
    applicant?.intake?.twilioSignupID ||
    applicant?.twilioSignupId ||
    applicant?.twilioId ||
    null;
  const paymentLink = twilioSignupId
    ? `https://www.kinscare.org/add-payment/${twilioSignupId}`
    : "";
  const paymentStatus = applicant?.payment?.status || "";
  const paymentDone =
    applicant?.hasAccount === true &&
    (paymentStatus === "authorized" || paymentStatus === "paid");

  const tel =
    applicant?.primaryContact?.phone ??
    applicant?.phone ??
    applicant?.contact?.channel?.address ??
    applicant?.contact?.channelAddress ??
    null;

  const onSaveContacted = async () => {
    if (!id) return;
    setSavingContacted(true);
    const providerUserId =
      (typeof applicant?.linkedUserId === "string" && applicant.linkedUserId) ||
      (typeof applicant?.userID === "string" && applicant.userID) ||
      (typeof (applicant as any)?.userId === "string" && (applicant as any).userId) ||
      (isUserId ? id : null);
    const isNonSms =
      isUserId ||
      applicant?.source === "providers" ||
      applicant?.channel === "providers";

    try {
      if (isNonSms && providerUserId) {
        await privateApi.patch(
          `${API_BASE}/jumpstart/providers/${providerUserId}/contacted`,
          {
            contacted,
            agentId: agentUserId || undefined,
          }
        );
      } else {
        await privateApi.post(
          `${API_BASE}/jumpstart/twilio-applicants/${id}/contacted`,
          {
            contacted,
            agentId: agentUserId || undefined,
          }
        );
      }
    } catch (e: any) {
      setContacted((v) => !v);
    } finally {
      setSavingContacted(false);
      fetchApplicant();
    }
  };

  const onSaveAccountCreated = async () => {
    if (!id) return;
    setSavingAccount(true);
    try {
      await privateApi.post(`${API_BASE}/jumpstart/edit-twilio-details`, {
        id,
        accountCreated,
      });
    } catch (e: any) {
      setAccountCreated((v) => !v);
    } finally {
      setSavingAccount(false);
      fetchApplicant();
    }
  };

  const handleOpenSMS = () => {
    setSmsMessage("");
    setSmsCountry("US");
    setSmsError(null);
    setSmsOk(null);
    setIsDialogOpen(true);
  };

  const sendSMS = async () => {
    setSmsError(null);
    setSmsOk(null);
    if (!tel) {
      setSmsError("No phone number available for this applicant.");
      return;
    }
    if (!smsMessage.trim()) {
      setSmsError("Message cannot be empty.");
      return;
    }
    try {
      setIsSending(true);
      await privateApi.post(`${TWILIO_BASE}/sms/send`, {
        body: smsMessage.trim(),
        to: tel, // should already be in E.164 e.g. +1206...
        country: smsCountry || "US",
      });
      setSmsOk("Message sent successfully.");
      setSmsMessage("");
    } catch (e: any) {
      setSmsError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Failed to send message."
      );
    } finally {
      setIsSending(false);
    }
  };

  const onAddNote = async () => {
    if (!id || !note.trim()) return;
    setAddingNote(true);
    try {
      await privateApi.post(`${API_BASE}/jumpstart/edit-twilio-details`, {
        id,
        note: note.trim(),
        userID: agentUserId,
      });
      setNote("");
    } catch {
      // keep note text for retry
    } finally {
      setAddingNote(false);
      fetchApplicant();
    }
  };

  if (loading) {
    return (
      <div className=" space-y-6 mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6 mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{err}</AlertDescription>
        </Alert>
        <Button onClick={fetchApplicant}>Retry</Button>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-800 mb-2">
          No applicant found
        </h3>
        <p className="text-slate-600 mb-4">
          The requested applicant data could not be loaded.
        </p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const tags: string[] = Array.isArray(applicant?.intake?.tags)
    ? applicant.intake.tags
    : Array.isArray(applicant.tags)
    ? applicant.tags
    : [];
  const agentJobs: any[] = Array.isArray(applicant.agent_jobs)
    ? applicant.agent_jobs
    : [];
  const recentJobId = agentJobs.reduce((latestId: string | null, job: any) => {
    const jobId = toIdString(job.jobId || job._id || job.id);
    if (!jobId) return latestId;
    const dateValue = job.created || job.createdAt || job.updatedAt;
    const date = dateValue ? new Date(dateValue).getTime() : 0;
    if (!latestId) return jobId;
    const latestJob = agentJobs.find(
      (item: any) => toIdString(item.jobId || item._id || item.id) === latestId
    );
    const latestDateValue =
      latestJob?.created || latestJob?.createdAt || latestJob?.updatedAt;
    const latestDate = latestDateValue
      ? new Date(latestDateValue).getTime()
      : 0;
    return date > latestDate ? jobId : latestId;
  }, null);
console.log(applicant)
  return (
    <div className=" space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
            {String(email || "?")
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {email || "No email provided"}
              </h1>
              {applicant?.jump_start && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
                  Jumpstart
                </Badge>
              )}
              {applicant?.source && (
                <Badge variant="secondary" className="border-0">
                  {applicant.source}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              Created: {fmtDate(applicant.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <MessageSquareText className="h-4 w-4" />
            Send SMS
          </Button>
          <Link href={`/agent/twilio/provider/${id}/post`}>
            <Button  variant="outline" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Post Job
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => handleCopyJobLink(recentJobId)}
            disabled={!recentJobId}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy latest job
          </Button>
          {/* <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button> */}
        </div>
      </div>

      {/* Contact Information */}
      <Card className="border border-slate-200/70 bg-white/80 backdrop-blur shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-slate-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Phone</p>
                <p className="font-semibold text-slate-900">{formatTel(tel)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Email</p>
                <p className="font-semibold text-slate-900 truncate">
                  {email || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Zipcode</p>
                <p className="font-semibold text-slate-900">
                  {zipcode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Created</p>
                <p className="font-semibold text-slate-900">
                  {fmtDate(applicant.timestamp || applicant.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 border border-slate-200/70 bg-white/80 backdrop-blur shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {paymentDone ? "Payment status" : "Payment Link"}
            </p>
            <p className="text-sm font-medium text-slate-900">
              {paymentDone
                ? "Payment done"
                : twilioSignupId
                ? `https://www.kinscare.org/add-payment/${twilioSignupId}`
                : "Payment link unavailable"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopyPaymentLink}
          disabled={!twilioSignupId || paymentDone}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          {paymentDone ? "Payment done" : "Copy Payment Link"}
        </Button>
      </div>

      {/* Event Log */}
      {/* <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-slate-600" />
            Event Log
          </CardTitle>
          <CardDescription>
            Timeline of actions captured in the flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventsLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-200 rounded" />
              <div className="h-4 w-52 bg-slate-200 rounded" />
            </div>
          ) : eventsError ? (
            <Alert variant="destructive">
              <AlertDescription>{eventsError}</AlertDescription>
            </Alert>
          ) : events.length === 0 ? (
            <div className="text-sm text-slate-500">
              No events yet. New activity will appear here.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
              {events.map((evt: any) => {
                const payloadText = summarizePayload(evt.payload);
                const summary = buildEventSummary(evt);
                return (
                  <div
                    key={evt._id || evt.createdAt}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {formatEventType(evt.eventType)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatActor(evt.actor)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmtDate(evt.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {summary.label}
                    </div>
                    {summary.detail && (
                      <div className="mt-1 text-xs text-slate-500">
                        {summary.detail}
                      </div>
                    )}
                    {payloadText && (
                      <div className="mt-2 text-xs text-slate-500">
                        {payloadText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card> */}

    

      {/* Notes Section */}
      <Card className="border border-slate-200/70 bg-white/80 backdrop-blur shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-slate-600" />
            Notes & Communication
          </CardTitle>
          <CardDescription>
            Add notes and track conversations. Newest notes appear first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Note Composer */}
          <div className="space-y-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about your conversation with this applicant (e.g., 'Called and left voicemail', 'Scheduled follow-up for tomorrow', etc.)"
              className="w-full min-h-[120px] rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {agentUserId
                  ? `You will be recorded as author (${agentUserId}).`
                  : "Author ID missing; note will be rejected by API."}
              </div>
              <Button
                onClick={onAddNote}
                disabled={addingNote || !note.trim() || !agentUserId}
                className="flex items-center gap-2"
              >
                {addingNote ? (
                  <>Adding...</>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Add Note
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Existing Notes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Previous Notes</h4>
            {Array.isArray(applicant?.intake?.notes) &&
            applicant.intake.notes.length > 0 ? (
              <div className="space-y-3">
                {applicant.intake.notes.map((n: any) => (
                  <div
                    key={n._id || n.createdAt}
                    className="p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-slate-900">
                        Note
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmtDate(n.createdAt)}{" "}
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {n.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Send className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No notes yet. Add your first note above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scripts */}
      <Card className="border border-slate-200/70 bg-white/80 backdrop-blur shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquareText className="h-5 w-5 text-slate-600" />
            Scripts
          </CardTitle>
          <CardDescription>
            Quick copy-and-paste templates for outreach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AGENT_SCRIPTS.map((script) => (
            <div
              key={script.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="font-semibold text-slate-900">
                  {script.title}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyText(script.body, script.title)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
                {script.body}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
        {/* Progress Tracking */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-slate-600" />
              Contact Status
            </CardTitle>
            <CardDescription>Track communication progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    contacted ? "bg-green-100" : "bg-slate-100"
                  }`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      contacted ? "text-green-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Contacted Applicant
                  </div>
                  <div className="text-sm text-slate-600">
                    Mark when initial contact is made
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={contacted}
                  onChange={(e) => setContacted(e.target.checked)}
                />
                <Button
                  size="sm"
                  disabled={savingContacted}
                  onClick={onSaveContacted}
                  className="min-w-20"
                >
                  {savingContacted ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-slate-600" />
              Account Status
            </CardTitle>
            <CardDescription>Track onboarding progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    accountCreated ? "bg-green-100" : "bg-slate-100"
                  }`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      accountCreated ? "text-green-600" : "text-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Account Created
                  </div>
                  <div className="text-sm text-slate-600">
                    Mark when account is set up
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={accountCreated}
                  onChange={(e) => setAccountCreated(e.target.checked)}
                />
                <Button
                  size="sm"
                  disabled={savingAccount}
                  onClick={onSaveAccountCreated}
                  className="min-w-20"
                >
                  {savingAccount ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* --- SMS Dialog --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="lg:max-w-2xl max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center justify-center text-center">
              <div className="mb-3">
                <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
                  {getInitials(email || "A")}
                </div>
              </div>
              <p className="font-bold text-2xl text-gray-800">
                {email || "Applicant"}
              </p>
              <div className="flex items-center space-x-2 mt-2 text-gray-700">
                <Phone size={16} />
                <p className="text-sm font-medium">
                  Send a text to {formatTel(tel)}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Alerts */}
          {smsError && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{smsError}</AlertDescription>
            </Alert>
          )}
          {smsOk && (
            <Alert className="mb-3 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                {smsOk}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-6">
              <div className="md:col-span-4">
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={8}
                  placeholder="Type your SMS to the applicant…"
                  className="block p-2.5 w-full text-sm focus-visible:outline-blue-500 text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="country"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Country (ISO)
                </label>
                <input
                  id="country"
                  value={smsCountry}
                  onChange={(e) => setSmsCountry(e.target.value.toUpperCase())}
                  placeholder="US"
                  className="block p-2.5 w-full text-sm focus-visible:outline-blue-500 text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500 mt-2">
                  Default is <b>US</b>. Use ISO code, e.g., <b>CA</b>
                  .
                </div>
              </div>
            </div>

            <Button
              onClick={sendSMS}
              className="w-full flex items-center justify-center gap-2"
              disabled={isSending || !smsMessage.trim() || !tel}
            >
              {isSending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </Button>
            <div className="text-xs text-slate-500 text-center">
              Messages will be sent via Twilio. Standard carrier rates may
              apply.
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Jobs Posted for this Applicant */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-slate-600" />
            Jobs Posted for this Applicant
          </CardTitle>
          <CardDescription>
            Agent-created jobs linked to this Twilio lead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agentJobs.length === 0 ? (
            <div className="text-center py-10">
              <div className="h-12 w-12 rounded-xl bg-slate-100 mx-auto mb-3 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">No jobs posted yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Use the <span className="font-medium">Post Job</span> button
                above to create a job for this applicant.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {agentJobs.map((job: any, idx: number) => {
                const jobId = toIdString(job.jobId || job._id || job.id);
                const created = fmtDate(job.created);
                const schedule: string[] = Array.isArray(job.schedule)
                  ? job.schedule
                  : [];
                const licenses: string[] = Array.isArray(job.licenses)
                  ? job.licenses
                  : [];
                const days: string[] = Array.isArray(job.days) ? job.days : [];
                const zipcode = job.zipcode || applicant?.intake?.zipcode || applicant.zipcode || "—";
                const state = job.state || "—";

                return (
                  <div
                    key={jobId || idx}
                    className="p-4 rounded-xl border bg-white"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {job.title || "Untitled Job"}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Created: {created}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[11px]">
                          Job ID: {jobId || "—"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="font-medium text-slate-700">
                          Share job link:
                        </span>
                        {jobId ? (
                          <button
                            type="button"
                            onClick={() => handleCopyJobLink(jobId)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            https://www.kinscare.org/jobs/{jobId}
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span>—</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {jobId ? (
                          <Link href={`/agent/jobs/${jobId}`}>
                            <Button size="sm" variant="outline">
                              View Job
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            View Job
                          </Button>
                        )}
                        {jobId ? (
                          <Link href={`/agent/jobs/${jobId}/edit`}>
                            <Button size="sm">Edit Job</Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled>
                            Edit Job
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRequestDeleteJob(job)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {schedule.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {licenses.map((l: string) => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                      {days.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {days.join(", ")}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <span className="font-medium">Location:</span>{" "}
                      {state !== "—" || zipcode !== "—"
                        ? `${state} ${zipcode}`
                        : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this job?</DialogTitle>
            <DialogDescription>
              This will remove the job from the Jobs collection and unlink it
              from this applicant. This action cannot be undone. Continue?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700 mb-2">
            <div className="font-medium">Job</div>
            <div>
              Title:{" "}
              <span className="font-semibold">
                {targetJob?.title || "Untitled Job"}
              </span>
            </div>
            <div>Created: {fmtDate(targetJob?.created)}</div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDeleteJob}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
