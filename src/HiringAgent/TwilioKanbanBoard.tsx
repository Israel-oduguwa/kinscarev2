"use client";

import React from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search } from "lucide-react";

import TwilioColumn from "./TwilioColumn";
import {
  Applicant,
  BoardState,
  COLUMN_CONFIG,
  COLUMN_ORDER,
  ColumnKey,
  FiltersState,
  FlowState,
  Meta,
  TwilioApplicantRaw,
} from "./TwilioKanbanTypes";
import { useToast } from "@/components/ui/use-toast";

type TwilioKanbanBoardProps = {
  privateApi: any; // axios-like instance
  agentId?: string | null;
};

// Helper: find which column currently holds an applicant
function findColumnOfApplicant(
  id: string,
  board: BoardState
): ColumnKey | null {
  for (const col of COLUMN_ORDER) {
    if (board[col].some((a) => a._id === id)) return col;
  }
  return null;
}

// Helper: get full applicant from current board
function findApplicant(board: BoardState, id: string): Applicant | null {
  for (const col of COLUMN_ORDER) {
    const found = board[col].find((a) => a._id === id);
    if (found) return found;
  }
  return null;
}

function flowStateToStage(flowState?: FlowState | string | null): ColumnKey {
  switch (flowState) {
    case "INTAKE_COMPLETE":
      return "confirmed";
    case "JOB_POSTED":
      return "post_job";
    case "CARE_GIVERS_SENT":
      return "add_payment";
    case "MATCHED":
      return "match_made";
    case "STUCK":
      return "confirmed";
    case "CLOSED":
      return "match_made";
    case "INTAKE_INCOMPLETE":
    default:
      return "jobs";
  }
}

// Helper: map raw docs from API to initial board state
function mapApplicantsToBoard(raw: TwilioApplicantRaw[]): BoardState {
  const base: BoardState = {
    jobs: [],
    confirmed: [],
    post_job: [],
    add_payment: [],
    match_made: [],
  };

  raw.forEach((d: any) => {
    const isFlowDoc =
      !!d.flowState || !!d.intake || !!d.primaryContact || !!d.payment;
    const preferredId = d.linkedUserId || d.userID || d.userId || d.id;
    const fallbackId =
      typeof d._id === "string" ? d._id : d._id != null ? String(d._id) : null;
    const id = isFlowDoc
      ? fallbackId || crypto.randomUUID?.() || Math.random().toString(36)
      : preferredId
      ? String(preferredId)
      : fallbackId || crypto.randomUUID?.() || Math.random().toString(36);

    const auth = (d.auth || {}) as Record<string, any>;
    const intake = (d.intake || {}) as Record<string, any>;
    const payment = (d.payment || {}) as Record<string, any>;
    const flowState = (d.flowState || "") as FlowState | string;

    const isRegistered =
      typeof d.hasAccount === "boolean"
        ? d.hasAccount
        : !!d.existingAccount || auth.mode === "clerk" || auth.mode === "email";

    const jump = d.jumpstart || d.jump_start || {};
    const contacted =
      !!intake.providerContacted ||
      !!d.contacted ||
      !!(jump as any).providerContacted ||
      !!(jump as any).provider_contacted ||
      !!(jump as any).providercontacted;
    const match = jump.match || {};

    const paymentStatus = payment.status || "";
    const paymentVerified =
      paymentStatus === "paid" || paymentStatus === "authorized";
    const paymentApplied = paymentVerified || paymentStatus === "pending";

    const matchStatus = (match.status || "") as string;
    const jobStatus = (d.jobStatus || "") as string;

    const matched = flowState === "MATCHED" || matchStatus === "matched";

    // Provider approval can come from either jobStatus or match.status
    const providerApproved =
      matchStatus === "provider_approved" ||
      matchStatus === "matched" ||
      jobStatus === "approved" ||
      jobStatus === "provider_approved";

    // 1) Start from DB workflowStage if valid
    const rawStage = (d.workflowStage || "") as ColumnKey | string;
    let stage: ColumnKey;

    if (rawStage && COLUMN_ORDER.includes(rawStage as ColumnKey)) {
      stage = rawStage as ColumnKey;
    } else {
      stage = flowStateToStage(flowState);
    }

    // Helper: only move "forwards" in the pipeline
    const advanceTo = (col: ColumnKey) => {
      const currentIndex = COLUMN_ORDER.indexOf(stage);
      const targetIndex = COLUMN_ORDER.indexOf(col);
      if (targetIndex > currentIndex) {
        stage = col;
      }
    };

    // 3) Promote based on underlying facts (never downgrade)

    // If contacted → at least confirmed
    if (contacted) {
      advanceTo("confirmed");
    }

    // If there is a job → at least post_job
    const jobCount = typeof d.jobCount === "number" ? d.jobCount : null;
    const lastJobCreated =
      typeof d.lastJobCreated === "string" ? d.lastJobCreated : null;

    if (!!d.jobId || !!d.post_job || (jobCount && jobCount > 0)) {
      advanceTo("post_job");
    }

    // If payment applied or verified → at least add_payment
    if (paymentApplied || paymentVerified) {
      advanceTo("add_payment");
    }

    // If matched → must be in match_made
    if (matched) {
      advanceTo("match_made");
    }

    if (!contacted && stage === "confirmed") {
      stage = "jobs";
    }

    // 4) Derived flags for UI from final stage
    const stageIndex = COLUMN_ORDER.indexOf(stage);
    const postJob = stageIndex >= COLUMN_ORDER.indexOf("post_job");
    const addPayment =
      stageIndex >= COLUMN_ORDER.indexOf("add_payment") || paymentApplied;
    const matchMade = matched || stage === "match_made";

    const paymentRequired = payment.required !== false;
    const paymentNeeded = paymentRequired && !paymentVerified;

    const applicant: Applicant = {
      ...d,
      _id: id,
      email: d.primaryContact?.email ?? d.email ?? auth.email ?? null,
      phone:
        d.primaryContact?.phone ??
        d.phone ??
        auth.tel ??
        d.contact?.channel?.address ??
        (d.contact as any)?.channelAddress ??
        null,
      zipcode: intake.zipcode ?? d.zipcode ?? null,
      source: d.entryTrigger ?? d.source ?? auth.acquisition_channel ?? "web",
      channel: d.channel ?? "web",
      tags: intake.tags ?? d.tags ?? [],
      jobCount: jobCount ?? undefined,
      lastJobCreated: lastJobCreated ?? undefined,

      stage,
      contacted,
      postJob,
      addPayment,
      matchMade,
      verified: paymentVerified,
      hasFreshJob:
        !!lastJobCreated &&
        Date.now() - new Date(lastJobCreated).getTime() <
          14 * 24 * 60 * 60 * 1000,
      paymentNeeded,
      isRegistered,
    };

    base[stage].push(applicant);
  });

  return base;
}

const TwilioKanbanBoard: React.FC<TwilioKanbanBoardProps> = ({
  privateApi,
  agentId,
}) => {
  const { toast } = useToast();

  const [board, setBoard] = React.useState<BoardState>({
    jobs: [],
    confirmed: [],
    post_job: [],
    add_payment: [],
    match_made: [],
  });

  const [meta, setMeta] = React.useState<Meta | null>(null);
  const [filters, setFilters] = React.useState<FiltersState>({
    search: "",
    hasAccount: "all",
    source: "sms",
    jobWindow: "any",
    postedJob: "all",
  });

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragError, setDragError] = React.useState<string | null>(null);

  // ---------- Fetch applicants ----------
  const fetchApplicants = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDragError(null);

      const params: Record<string, any> = {
        page: 1,
        limit: 50,
        sort: "-created",
      };

      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.hasAccount !== "all") params.hasAccount = filters.hasAccount;

      const endpoint = "/api/v1/providers/jumpstart/get-twilio-applicants";
      if (filters.source !== "all") {
        params.source = filters.source;
      }

      const res = await privateApi.get(endpoint, { params });
      console.log(endpoint)

      const payload = res.data || {};
      const raw: TwilioApplicantRaw[] = payload.data || [];
      const meta: Meta | null = payload.meta || null;

      setMeta(meta);
      setBoard(mapApplicantsToBoard(raw));
    } catch (err) {
      console.log(err)
      console.error("Failed to fetch Twilio applicants", err);
      setError("Failed to load applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    privateApi,
    filters.search,
    filters.hasAccount,
    filters.source,
    filters.jobWindow,
    filters.postedJob,
  ]);

  React.useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // ---------- Filters handlers ----------
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleHasAccountChange = (value: "all" | "true" | "false") => {
    setFilters((prev) => ({ ...prev, hasAccount: value }));
  };

  const handleSourceChange = (value: "sms" | "providers" | "all") => {
    setFilters((prev) => ({
      ...prev,
      source: value,
    }));
  };

  const handleJobWindowChange = (value: "any" | "3d" | "2w" | "4w") => {
    setFilters((prev) => ({ ...prev, jobWindow: value }));
  };

  const handlePostedJobChange = (value: "all" | "true" | "false") => {
    setFilters((prev) => ({ ...prev, postedJob: value }));
  };

  // ---------- Remove helper (used by delete) ----------
  const removeApplicantFromBoard = React.useCallback((id: string) => {
    setBoard((prev) => ({
      jobs: prev.jobs.filter((a) => a._id !== id),
      confirmed: prev.confirmed.filter((a) => a._id !== id),
      post_job: prev.post_job.filter((a) => a._id !== id),
      add_payment: prev.add_payment.filter((a) => a._id !== id),
      match_made: prev.match_made.filter((a) => a._id !== id),
    }));
  }, []);

  // ---------- Update helper (used by toggles & drag) ----------
  const updateApplicantInBoard = React.useCallback(
    (
      id: string,
      updater: (a: Applicant) => Applicant,
      targetStage?: ColumnKey
    ) => {
      setBoard((prev) => {
        const clone: BoardState = {
          jobs: [...prev.jobs],
          confirmed: [...prev.confirmed],
          post_job: [...prev.post_job],
          add_payment: [...prev.add_payment],
          match_made: [...prev.match_made],
        };

        const fromColumn = findColumnOfApplicant(id, clone);
        if (!fromColumn) return prev;

        const list = [...clone[fromColumn]];
        const idx = list.findIndex((a) => a._id === id);
        if (idx === -1) return prev;

        const updated = updater(list[idx]);

        // remove from old column
        list.splice(idx, 1);
        clone[fromColumn] = list;

        const finalStage = targetStage || updated.stage || fromColumn;
        updated.stage = finalStage;

        // add to new column at top
        clone[finalStage] = [updated, ...clone[finalStage]];

        return clone;
      });
    },
    []
  );

  // ---------- Toggle handlers ----------

  const getProviderContext = React.useCallback(
    (id: string) => {
      const applicant:any = findApplicant(board, id);
      const userId =
        applicant?.linkedUserId ||
        applicant?.userID ||
        (applicant as any)?.userId ||
        null;
      const isNonSms =
        applicant?.intake?.nonSms === true ||
        applicant?.source === "providers" ||
        applicant?.channel === "providers" ||
        filters.source === "providers";
      console.log(isNonSms)
      return { applicant, userId, isNonSms };
    },
    [board, filters.source]
  );

  // 1) Contacted toggle → Jobs ⇄ Confirmed
  const handleToggleContacted = (id: string, value: boolean) => {
    console.log(id)
    const { userId, isNonSms } = getProviderContext(id);
    const targetStage: ColumnKey = value ? "confirmed" : "jobs";
    const revertStage: ColumnKey = value ? "jobs" : "confirmed";

    updateApplicantInBoard(
      id,
      (a) => ({
        ...a,
        contacted: value,
      }),
      targetStage
    );

    (async () => {
      try {
        if (isNonSms) {
          if (!userId) throw new Error("Missing userID for provider toggle");
          await privateApi.patch(
            `/api/v1/providers/jumpstart/providers/${userId}/contacted`,
            {
              contacted: value,
              agentId: agentId || undefined,
            }
          );
        } else {
          console.log(id)
          await privateApi.post(
            `/api/v1/providers/jumpstart/twilio-applicants/${id}/contacted`,
            {
              contacted: value,
              agentId: agentId || undefined,
            }
          );
        }
      } catch (err) {
        console.error("Failed to update contacted status", err);
        setDragError("Failed to save contacted status. Reverting.");

        updateApplicantInBoard(
          id,
          (a) => ({
            ...a,
            contacted: !value,
          }),
          revertStage
        );
      }
    })();
  };

  // 2) Post job toggle → Confirmed ⇄ Post job
  const handleTogglePostJob = (id: string, value: boolean) => {
    const { applicant, userId, isNonSms } = getProviderContext(id);
    // Forward move only: validate job exists
    if (value) {
      const hasAgentJob =
        (applicant?.agent_jobs && applicant.agent_jobs.length > 0) ||
        (typeof applicant?.jobCount === "number" && applicant.jobCount > 0);
      const hasJobId = !!applicant?.jobId;
      const hasFreshJob = !!applicant?.hasFreshJob;
      const hasAnyJobEvidence = hasJobId || hasAgentJob || hasFreshJob;

      if (!hasAnyJobEvidence) {
        toast({
          variant: "destructive",
          title: "No job posted yet",
          description:
            "You must create a job post for this provider before moving to the Post job step.",
        });
        return;
      }
    }

    const targetStage: ColumnKey = value ? "post_job" : "confirmed";
    const revertStage: ColumnKey = value ? "confirmed" : "post_job";

    updateApplicantInBoard(
      id,
      (a) => ({
        ...a,
        postJob: value,
      }),
      targetStage
    );

    (async () => {
      try {
        if (isNonSms) {
          if (!userId) throw new Error("Missing userID for provider toggle");
          await privateApi.patch(
            `/api/v1/providers/jumpstart/providers/${userId}/post-job`,
            {
              post_job: value,
              agentId: agentId || undefined,
            }
          );
        } else {
          await privateApi.post(
            `/api/v1/providers/jumpstart/twilio-applicants/${id}/mark-provider-post-job`,
            {
              post_job: value,
              agentId: agentId || undefined,
            }
          );
        }
      } catch (err) {
        console.error("Failed to mark provider post job", err);
        setDragError("Failed to save post job status. Reverting.");

        updateApplicantInBoard(
          id,
          (a) => ({
            ...a,
            postJob: !value,
          }),
          revertStage
        );
      }
    })();
  };

  // 3) Payment applied toggle → Post job ⇄ Add payment
  const handleToggleAddPayment = (id: string, value: boolean) => {
    // Forward move only: validate provider approval
    if (value) {
      const applicant = findApplicant(board, id);
      const flowState = (applicant?.flowState || "") as string;
      const hasJob =
        !!applicant?.jobId ||
        !!applicant?.intake?.providerPostJob ||
        (typeof applicant?.jobCount === "number" && applicant.jobCount > 0);
      const jobPosted =
        flowState === "JOB_POSTED" ||
        flowState === "CARE_GIVERS_SENT" ||
        flowState === "MATCHED" ||
        hasJob;

      if (!jobPosted) {
        toast({
          variant: "destructive",
          title: "Job not posted yet",
          description:
            "A job must be posted before moving to the Add payment step.",
        });
        return;
      }
    }

    const targetStage: ColumnKey = value ? "add_payment" : "post_job";
    const revertStage: ColumnKey = value ? "post_job" : "add_payment";

    updateApplicantInBoard(
      id,
      (a) => ({
        ...a,
        addPayment: value,
        paymentNeeded: !value,
      }),
      targetStage
    );

    (async () => {
      try {
        await privateApi.post(
          `/api/v1/providers/jumpstart/twilio-signup/${id}/mark-payment-applied`,
          {
            paymentApplied: value,
            agentId: agentId || undefined,
          }
        );
      } catch (err) {
        console.error("Failed to mark payment applied", err);
        setDragError("Failed to save payment status. Reverting.");

        updateApplicantInBoard(
          id,
          (a) => ({
            ...a,
            addPayment: !value,
            paymentNeeded: value,
          }),
          revertStage
        );
      }
    })();
  };

  type MatchApplicantPayload = {
    id: string;
    tempHash?: string | null;
    email?: string | null;
    phone?: string | null;
    zipcode?: string | null;
    existingAccount?: boolean | null;
  };

  // 4) Match made toggle → Add payment ⇄ Match made
  const handleToggleMatchMade = (app: MatchApplicantPayload, value: boolean) => {
    const id = app.id;
    const { applicant, userId, isNonSms } = getProviderContext(id);

    // Forward move only: validate payment verified
    if (value) {
      const paymentStatus = applicant?.payment?.status || "";
      const paymentVerified =
        paymentStatus === "paid" || paymentStatus === "authorized";
      const paymentRequired = applicant?.payment?.required !== false;

      if (paymentRequired && !paymentVerified) {
        toast({
          variant: "destructive",
          title: "Payment not verified",
          description:
            "You must verify the provider’s payment before matching caregivers.",
        });
        return;
      }
    }

    const targetStage: ColumnKey = value ? "match_made" : "add_payment";
    const revertStage: ColumnKey = value ? "add_payment" : "match_made";

    updateApplicantInBoard(
      id,
      (a) => ({
        ...a,
        matchMade: value,
      }),
      targetStage
    );

    (async () => {
      try {
        if (isNonSms) {
          if (!userId) throw new Error("Missing userID for provider toggle");
          await privateApi.patch(
            `/api/v1/providers/jumpstart/providers/${userId}/match-caregiver`,
            {
              agentId: agentId || undefined,
              matched: value,
              temp_hash: app.tempHash ?? undefined,
              email: app.email ?? undefined,
              phone: app.phone ?? undefined,
              zipcode: app.zipcode ?? undefined,
              existingAccount: app.existingAccount ?? undefined,
            }
          );
        } else {
          // ✅ Save match on backend (backend may send SMS too)
          await privateApi.post(
            `/api/v1/providers/jumpstart/twilio-signup/${id}/match-caregiver`,
            {
              agentId: agentId || undefined,
              matched: value,
              // optional: send these too if your server wants them
              temp_hash: app.tempHash ?? undefined,
              email: app.email ?? undefined,
              phone: app.phone ?? undefined,
              zipcode: app.zipcode ?? undefined,
              existingAccount: app.existingAccount ?? undefined,
            }
          );
        }

        /**
         * ✅ Client-side SMS ONLY when:
         * - marking matched (value === true)
         * - provider has no existing account
         * - we have phone + tempHash
         */
        if (
          value === true &&
          app.existingAccount === false &&
          app.phone &&
          app.tempHash
        ) {
          const signupLink =
            `https://kinscare.org/twilio/signup` +
            `?twilioId=${id}` +
            `&temp_hash=${encodeURIComponent(app.tempHash)}` +
            `&email=${encodeURIComponent(app.email || "")}` +
            `&zipcode=${encodeURIComponent(app.zipcode || "")}`;

          const message =
            `✅ Great news from KinsCare!\n\n` +
            `We’ve found a caregiver match for your job.\n\n` +
            `To view your match and continue, please create your KinsCare account here:\n` +
            `${signupLink}\n\n` +
            `Once you sign up, your job will automatically appear in your account.\n` +
            `Need help? Reply to this message anytime.`;

          const sms_payload = {
            body: message,
            to: app.phone,
            country: "US",
          };

          await privateApi.post(`/api/v1/twilio/sms/send`, sms_payload);
        }
      } catch (err) {
        console.error("Failed to update match caregiver", err);
        setDragError("Failed to save match status. Reverting.");

        updateApplicantInBoard(
          id,
          (a) => ({
            ...a,
            matchMade: !value,
          }),
          revertStage
        );
      }
    })();
  };

  // 5) Remove provider from flow (keep Twilio lead, reset flow)
  const handleRemoveFromFlow = (id: string, jobId?: string | null) => {
    if (!jobId) {
      toast({
        variant: "destructive",
        title: "No job linked",
        description:
          "This provider does not have a linked job to remove from the flow.",
      });
      return;
    }

    (async () => {
      try {
        await privateApi.patch(
          `/api/v1/providers/jumpstart/flow/remove-provider/${jobId}`
        );

        toast({
          title: "Provider removed from flow",
          description:
            "The provider has been removed from the Jumpstart flow. The lead is still available on the board.",
        });

        // Re-sync from backend so flags/workflowStage are correct
        await fetchApplicants();
      } catch (err) {
        console.error("Failed to remove provider from flow", err);
        setDragError(
          "Failed to remove provider from flow. Please try again."
        );
      }
    })();
  };

  // 6) Delete Twilio signup (remove from Kanban forever)
  const handleDeleteSignup = (applicant: Applicant) => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            "Delete this provider lead permanently? This cannot be undone."
          );

    if (!confirmed) return;

    // Optimistic: remove from board immediately
    removeApplicantFromBoard(applicant._id);

    const isNonSms =
      filters.source === "providers" ||
      applicant.source === "providers" ||
      applicant.channel === "providers";

    const userId = applicant.userID || (applicant as any).userId || null;

    // Existing accounts must be deleted by userID, not the Twilio doc _id.
    // Non-SMS providers also require userID for the remove-from-flow endpoint.
    const deleteId = isNonSms
      ? userId
      : applicant.existingAccount && userId
      ? userId
      : applicant._id;

    (async () => {
      try {
        if (isNonSms) {
          if (!deleteId) {
            throw new Error("Missing userID for non-SMS provider removal");
          }
          await privateApi.patch(
            `/api/v1/providers/jumpstart/providers/${deleteId}/remove-from-flow`
          );
          toast({
            title: "Provider removed from flow",
            description: "The provider has been removed from the Jumpstart flow.",
          });
        } else {
          await privateApi.delete(
            `/api/v1/providers/jumpstart/twilio/${deleteId}`
          );

          toast({
            title: "Lead deleted",
            description: "The Twilio signup has been removed permanently.",
          });
        }
      } catch (err) {
        console.error("Failed to remove lead", err);
        setDragError("Failed to remove lead. Refreshing board.");
        // restore from backend
        await fetchApplicants();
      }
    })();
  };

  // ---------- Drag & drop logic using Pragmatic Drag & Drop ----------
  React.useEffect(() => {
    const cleanup = monitorForElements({
      onDrop({ source, location }) {
        setDragError(null);

        const sourceData: any = source.data;
        if (!sourceData || sourceData.type !== "applicant") return;

        const applicantId = sourceData.applicantId as string;
        const fromColumnKey = sourceData.fromColumnKey as ColumnKey;

        const dropTargets = location.current.dropTargets;
        if (!dropTargets.length) return;

        const columnTarget = dropTargets.find(
          (t) => t.data && (t.data as any).type === "column"
        );

        if (!columnTarget) return;

        const destColumnKey = (columnTarget.data as any)
          .columnKey as ColumnKey;

        if (!destColumnKey || destColumnKey === fromColumnKey) return;

        // Only adjacent moves allowed
        const sourceIndex = COLUMN_ORDER.indexOf(fromColumnKey);
        const destIndex = COLUMN_ORDER.indexOf(destColumnKey);

        if (
          sourceIndex === -1 ||
          destIndex === -1 ||
          Math.abs(destIndex - sourceIndex) > 1
        ) {
          setDragError("You can only move one step forward or backward.");
          return;
        }

        // DRAG = TOGGLE: decide which toggle to call based on from/to

        // Jobs ⇄ Confirmed
        if (
          (fromColumnKey === "jobs" && destColumnKey === "confirmed") ||
          (fromColumnKey === "confirmed" && destColumnKey === "jobs")
        ) {
          const value = destColumnKey === "confirmed";
          handleToggleContacted(applicantId, value);
          return;
        }

        // Confirmed ⇄ Post job
        if (
          (fromColumnKey === "confirmed" && destColumnKey === "post_job") ||
          (fromColumnKey === "post_job" && destColumnKey === "confirmed")
        ) {
          const value = destColumnKey === "post_job";
          handleTogglePostJob(applicantId, value);
          return;
        }

        // Post job ⇄ Add payment
        if (
          (fromColumnKey === "post_job" && destColumnKey === "add_payment") ||
          (fromColumnKey === "add_payment" && destColumnKey === "post_job")
        ) {
          const value = destColumnKey === "add_payment";
          handleToggleAddPayment(applicantId, value);
          return;
        }

        // Add payment ⇄ Match made
        if (
          (fromColumnKey === "add_payment" && destColumnKey === "match_made") ||
          (fromColumnKey === "match_made" && destColumnKey === "add_payment")
        ) {
          const value = destColumnKey === "match_made";
          // pass minimal payload so types line up
          handleToggleMatchMade({ id: applicantId }, value);
          return;
        }
      },
    });

    return () => {
      cleanup();
    };
  }, [
    handleToggleContacted,
    handleTogglePostJob,
    handleToggleAddPayment,
    handleToggleMatchMade,
  ]);

  const totalCount = React.useMemo(() => {
    return COLUMN_ORDER.reduce((sum, col) => sum + board[col].length, 0);
  }, [board]);

  return (
    <div className="flex flex-col h-full w-full space-y-6">
      {/* Filters + Legend */}
      <Card className="border border-slate-200/70 bg-white/80 backdrop-blur shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] rounded-2xl">
        <CardContent className="pt-5 pb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <Input
                  placeholder="Search by email, phone or zipcode..."
                  className="pl-8 h-10 text-sm bg-white/90"
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <Select
                  value={filters.source}
                  onValueChange={(val: "sms" | "providers" | "all") =>
                    handleSourceChange(val)
                  }
                >
                  <SelectTrigger className="h-10 w-44 text-xs bg-white/90">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS flows</SelectItem>
                    <SelectItem value="providers">Non-SMS providers</SelectItem>
                    <SelectItem value="all">All flows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={filters.hasAccount}
                  onValueChange={(val: "all" | "true" | "false") =>
                    handleHasAccountChange(val)
                  }
                >
                  <SelectTrigger className="h-10 w-44 text-xs bg-white/90">
                    <SelectValue placeholder="Account filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All providers</SelectItem>
                    <SelectItem value="true">Registered only</SelectItem>
                    <SelectItem value="false">Unregistered only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.source === "providers" && (
                <>
                  <Select
                    value={filters.jobWindow}
                    onValueChange={(val: "any" | "3d" | "2w" | "4w") =>
                      handleJobWindowChange(val)
                    }
                  >
                    <SelectTrigger className="h-10 w-48 text-xs bg-white/90">
                      <SelectValue placeholder="Job activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any job date</SelectItem>
                      <SelectItem value="3d">Jobs in last 3 days</SelectItem>
                      <SelectItem value="2w">Jobs in last 2 weeks</SelectItem>
                      <SelectItem value="4w">Jobs in last 4 weeks</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.postedJob}
                    onValueChange={(val: "all" | "true" | "false") =>
                      handlePostedJobChange(val)
                    }
                  >
                    <SelectTrigger className="h-10 w-44 text-xs bg-white/90">
                      <SelectValue placeholder="Job posts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All providers</SelectItem>
                      <SelectItem value="true">Has job posts</SelectItem>
                      <SelectItem value="false">No job posts</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs bg-white/90"
                onClick={() => fetchApplicants()}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>Unregistered provider</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Registered provider</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span>Has fresh job (&lt; 14 days)</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Payment needed</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
              Total leads{" "}
              <span className="ml-1 font-semibold text-slate-900">
                {totalCount}
              </span>
            </span>
            {meta && (
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                Page{" "}
                <span className="font-semibold text-slate-900">
                  {meta.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {meta.pages}
                </span>
              </span>
            )}
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {dragError && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              {dragError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban board */}
      <div className="flex-1 min-h-[400px] rounded-3xl border border-slate-200/70 bg-slate-50/70 p-3 md:p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {COLUMN_ORDER.map((col) => (
              <div key={col} className="w-[390px] shrink-0">
                <Card className="border-slate-200 bg-white/70">
                  <CardContent className="pt-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {COLUMN_CONFIG[col].title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {COLUMN_CONFIG[col].subtitle}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">—</span>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {COLUMN_ORDER.map((colKey) => (
              <TwilioColumn
                key={colKey}
                columnKey={colKey}
                items={board[colKey]}
                privateApi={privateApi}
                onToggleContacted={handleToggleContacted}
                onTogglePostJob={handleTogglePostJob}
                onToggleAddPayment={handleToggleAddPayment}
                onToggleMatchMade={handleToggleMatchMade}
                // NEW: actions for flow + delete
                onRemoveFromFlow={handleRemoveFromFlow}
                onDeleteSignup={handleDeleteSignup}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwilioKanbanBoard;
