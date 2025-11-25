"use client";

import React from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ColumnKey, Applicant } from "./TwilioKanbanTypes";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  onToggleContacted: (id: string, value: boolean) => void;
  onTogglePostJob: (id: string, value: boolean) => void;
  onToggleAddPayment: (id: string, value: boolean) => void;
  onToggleMatchMade: (payload: MatchApplicantPayload, value: boolean) => void;
  onRemoveFromFlow: (id: string, jobId?: string | null) => void;
  onDeleteSignup: (id: string) => void;
};

const TwilioApplicantCard: React.FC<TwilioApplicantCardProps> = ({
  applicant,
  columnKey,
  onToggleContacted,
  onTogglePostJob,
  onToggleAddPayment,
  onToggleMatchMade,
  onRemoveFromFlow,
  onDeleteSignup,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

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

  const email = applicant.email || "No email";
  const phone = applicant.phone || "No phone";
  const zipcode = applicant.zipcode || "No zipcode";

  const paymentVerified = !!applicant.jumpstart?.paymentVerified;
  const paymentApplied = !!applicant.jumpstart?.paymentApplied;
  const matchStatus = applicant.jumpstart?.match?.status || "";
  const jobStatus = applicant.jobStatus || "";

  const isRegistered = applicant.isRegistered;
  const paymentNeeded = applicant.paymentNeeded;

  return (
    <Card
      ref={ref}
      className="mb-2 p-3 shadow-sm border-slate-200 bg-white cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-800 break-all">
            {email}
          </p>
          <p className="text-[11px] text-slate-500">
            {phone} · {zipcode}
          </p>

          <div className="flex flex-wrap gap-1 mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                isRegistered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-purple-200 bg-purple-50 text-purple-700"
              }`}
            >
              {isRegistered ? "Registered" : "Unregistered"}
            </span>

            {jobStatus && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                Job: {jobStatus}
              </span>
            )}

            {paymentVerified && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                Payment verified
              </span>
            )}

            {!paymentVerified && paymentApplied && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                Payment applied
              </span>
            )}

            {matchStatus && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">
                Match: {matchStatus}
              </span>
            )}

            {paymentNeeded && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700">
                Payment needed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Switch row */}
      <div className="mt-3 grid grid-cols-2 gap-2">
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
            className="text-[11px]"
            onClick={() =>
              onRemoveFromFlow(
                applicant._id,
                (applicant as any).jobId ?? null
              )
            }
          >
            Remove from flow
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled
            className="text-[11px]"
            onClick={() => onDeleteSignup(applicant._id)}
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
          <Button size="sm" className="text-[11px]">
            View provider
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default TwilioApplicantCard;
