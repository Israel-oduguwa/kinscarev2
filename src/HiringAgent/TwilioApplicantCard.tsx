"use client";

import React from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ColumnKey, Applicant } from "./TwilioKanbanTypes";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatTimestamp(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEventType(value?: string | null) {
  if (!value) return "Activity";
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

function formatActor(
  actor?: {
    type?: string;
    channel?: string;
  } | null
) {
  if (!actor) return "";
  const type =
    actor.type === "agent"
      ? "Agent"
      : actor.type === "provider"
      ? "Provider"
      : actor.type === "caregiver"
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

type MatchApplicantPayload = {
  id: string;
  tempHash?: string | null;
  email?: string | null;
  phone?: string | null;
  zipcode?: string | null;
  existingAccount?: boolean | null;
};

type TwilioApplicantCardProps = {
  applicant: Applicant;
  columnKey: ColumnKey;
  privateApi: any;
  onToggleContacted: (id: string, value: boolean) => void;
  onTogglePostJob: (id: string, value: boolean) => void;
  onToggleAddPayment: (id: string, value: boolean) => void;
  onToggleMatchMade: (payload: MatchApplicantPayload, value: boolean) => void;
  onRemoveFromFlow: (id: string, jobId?: string | null) => void;
  onDeleteSignup: (applicant: Applicant) => void;
};

const TwilioApplicantCard: React.FC<TwilioApplicantCardProps> = ({
  applicant,
  columnKey,
  privateApi,
  onToggleContacted,
  onTogglePostJob,
  onToggleAddPayment,
  onToggleMatchMade,
  onRemoveFromFlow,
  onDeleteSignup,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [latestEvent, setLatestEvent] = React.useState<{
    label: string;
    detail?: string;
    actor?: string;
    timestamp: string;
  } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanup = draggable({
      element: el,
      getInitialData: () => ({
        type: "applicant",
        applicantId: applicant._id,
        fromColumnKey: columnKey,
      }),
    });

    return () => {
      cleanup();
    };
  }, [applicant._id, columnKey]);

  React.useEffect(() => {
    if (!applicant._id) return;
    let cancelled = false;
    
    const fetchLatestEvent = async () => {
      try {
        const flowId =
          (applicant as any)?.flowId ||
          (applicant as any)?.flow?.id ||
          (applicant as any)?.flow?._id ||
          applicant._id;
        const flowIdString =
          typeof flowId === "string"
            ? flowId
            : flowId?.$oid
            ? String(flowId.$oid)
            : flowId?.oid
            ? String(flowId.oid)
            : String(flowId);
        const res = await privateApi.get(
          `/api/v1/providers/jumpstart/flow/${flowIdString}/events`,
          { params: { page: 1, limit: 1 } }
        );
       
        const payload = res?.data || {};
        const events = Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload.data)
          ? payload.data
          : payload.data?.events || payload.events || [];
        const event = Array.isArray(events) ? events[0] : null;
        if (!event || cancelled) return;
        const summary = buildEventSummary(event);
        const actor = formatActor(event.actor);
        const label = summary.label;
        const timestamp = formatTimestamp(event.createdAt);
        if (!cancelled) {
          setLatestEvent({
            label,
            detail: summary.detail,
            actor,
            timestamp,
          });
        }
      } catch {
        if (!cancelled) {
          setLatestEvent(null);
        }
      }
    };
    
    fetchLatestEvent();
    return () => {
      cancelled = true;
    };
  }, [applicant._id, privateApi]);

  const email = applicant.email || "No email";
  const phone = applicant.phone || "No phone";
  const zipcode = applicant.zipcode || "No zipcode";

  const paymentStatus = applicant.payment?.status || "";
  const paymentVerified =
    paymentStatus === "paid" || paymentStatus === "authorized";
  const paymentApplied = paymentVerified || paymentStatus === "pending";
  const matchStatus =
    applicant.flowState === "MATCHED"
      ? "matched"
      : applicant.jumpstart?.match?.status || "";
  const jobStatus = applicant.jobStatus || "";

  const isRegistered = applicant.isRegistered;
  const paymentNeeded = applicant.paymentNeeded;

  const providerTimestamp = applicant.timestamp || applicant.createdAt || null;
  const activityLabel = latestEvent?.label || "No recent activity";
  const activityTimestamp = latestEvent?.timestamp || "—";
  const activityDetail = latestEvent?.detail || "";
  const activityActor = latestEvent?.actor || "";

  return (
    <Card
      ref={ref}
      className="mb-3 p-3 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] border border-slate-200/70 bg-white/90 rounded-2xl cursor-grab active:cursor-grabbing transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-900 break-all">
            {email}
          </p>
          <p className="text-[11px] text-slate-500">
            {phone} · {zipcode}
          </p>

          <div className="flex flex-wrap gap-1 mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                isRegistered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-purple-200 bg-purple-50 text-purple-700"
              }`}
            >
              {isRegistered ? "Registered" : "Unregistered"}
            </span>

            {jobStatus && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                Job: {jobStatus}
              </span>
            )}

            {paymentVerified && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                Payment verified
              </span>
            )}

            {!paymentVerified && paymentApplied && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                Payment applied
              </span>
            )}

            {matchStatus && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">
                Match: {matchStatus}
              </span>
            )}

            {paymentNeeded && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700">
                Payment needed
              </span>
            )}
          </div>
        </div>
        <span
          className={`mt-1 h-2.5 w-2.5 rounded-full ${
            isRegistered ? "bg-emerald-500" : "bg-purple-500"
          }`}
          aria-hidden
        />
      </div>

      <div className=" grid grid-cols-1 gap-1.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
        {/* <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
          <span className="uppercase tracking-wide">Provider added</span>
          <span className="font-medium text-slate-700">
            {formatTimestamp(providerTimestamp)}
          </span>
        </div> */}
        {/* <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
          <span className="uppercase tracking-wide">Team assistance</span>
          <span className="font-medium text-slate-700">
            {formatTimestamp(assistanceRequestedAt)}
          </span>
        </div> */}
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
          <span className="uppercase tracking-wide">Latest activity</span>
          <span className="font-medium text-slate-700">
            {activityTimestamp}
          </span>
        </div>
        <div className="text-[11px] text-slate-700">{activityLabel}</div>
        {activityActor && (
          <div className="text-[11px] text-slate-500">{activityActor}</div>
        )}
        {activityDetail && (
          <div className="text-[11px] text-slate-500">{activityDetail}</div>
        )}
      </div>

      {/* Switch row */}
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-white/80 px-2 py-2">
        {/* Contacted */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-600">Contacted</span>
          <Switch
            checked={applicant.contacted}
            onCheckedChange={(val) => onToggleContacted(applicant._id, val)}
          />
        </div>

        {/* Post job */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-600">Post job</span>
          <Switch
            checked={applicant.postJob}
            onCheckedChange={(val) => onTogglePostJob(applicant._id, val)}
          />
        </div>

        {/* Add payment */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-600">Add payment</span>
          <Switch
            checked={applicant.addPayment}
            onCheckedChange={(val) => onToggleAddPayment(applicant._id, val)}
          />
        </div>

        {/* Match made */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-600">Match made</span>
          <Switch
            checked={applicant.matchMade}
            onCheckedChange={(val) =>
              onToggleMatchMade(
                {
                  id: applicant._id,
                  tempHash: applicant.temp_hash,
                  email: applicant.email,
                  phone: applicant.phone,
                  zipcode: applicant.zipcode,
                  existingAccount: applicant.existingAccount,
                },
                val
              )
            }
          />
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-3 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-[11px] h-7 px-2"
            onClick={() =>
              onRemoveFromFlow(applicant._id, (applicant as any).jobId ?? null)
            }
          >
            Remove from flow
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="text-[11px] h-7 px-2"
            onClick={() => onDeleteSignup(applicant)}
          >
            Delete lead
          </Button>
        </div>

        <Link
          href={
            applicant._id
              ? `/agent/twilio/provider/${applicant._id}`
              : "/agent/twilio"
          }
        >
          <Button size="sm" className="text-[11px] h-7 px-3">
            View provider
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default TwilioApplicantCard;
