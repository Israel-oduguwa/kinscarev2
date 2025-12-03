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

// Helper: map raw docs from API to initial board state
function mapApplicantsToBoard(raw: TwilioApplicantRaw[]): BoardState {
  const base: BoardState = {
    jobs: [],
    confirmed: [],
    post_job: [],
    add_payment: [],
    match_made: [],
  };

  raw.forEach((d:any) => {
    const preferredId = d.userID || d.userId || d.id;
    const fallbackId =
      typeof d._id === "string" ? d._id : d._id != null ? String(d._id) : null;
    const id = preferredId
      ? String(preferredId)
      : fallbackId || crypto.randomUUID?.() || Math.random().toString(36);

    const auth = (d.auth || {}) as Record<string, any>;

    const isRegistered =
      !!d.existingAccount || auth.mode === "clerk" || auth.mode === "email";
    const contacted = !!d.contacted;

    const jump = d.jumpstart || {};
    const match = jump.match || {};

    const paymentApplied = !!jump.paymentApplied;
    const paymentVerified = !!jump.paymentVerified;

    const matchStatus = (match.status || "") as string;
    const jobStatus = (d.jobStatus || "") as string;

    const matched = matchStatus === "matched";

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
      // 2) Fallback base from flags
      if (contacted) {
        stage = "confirmed";
      } else {
        stage = "jobs";
      }
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

    // 4) Derived flags for UI from final stage
    const stageIndex = COLUMN_ORDER.indexOf(stage);
    const postJob = stageIndex >= COLUMN_ORDER.indexOf("post_job");
    const addPayment =
      stageIndex >= COLUMN_ORDER.indexOf("add_payment") ||
      paymentApplied ||
      paymentVerified;
    const matchMade = matched || stage === "match_made";

    const paymentNeeded = !paymentApplied && !paymentVerified;

    const applicant: Applicant = {
      ...d,
      _id: id,
      email: d.email ?? auth.email ?? null,
      phone:
        d.phone ??
        auth.tel ??
        d.contact?.channel?.address ??
        (d.contact as any)?.channelAddress ??
        null,
      zipcode: d.zipcode ?? null,
      source: d.source ?? auth.acquisition_channel ?? "web",
      channel: d.channel ?? "web",
      tags: d.tags ?? [],
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
    source: "twilio",
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

      let endpoint = "/api/v1/providers/jumpstart/get-twilio-applicants";

      if (filters.source === "providers") {
        endpoint = "/api/v1/providers/jumpstart/get-providers";
        params.sort = "-lastJobCreated";

        if (filters.postedJob !== "all") {
          params.postedJob = filters.postedJob;
        }

        if (filters.jobWindow !== "any") {
          const now = new Date();
          const days =
            filters.jobWindow === "3d"
              ? 3
              : filters.jobWindow === "2w"
              ? 14
              : 28;
          const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          params.jobFrom = from.toISOString();
        }
      }

      const res = await privateApi.get(endpoint, { params });
      console.log(res)

      const payload = res.data || {};
      const raw: TwilioApplicantRaw[] = payload.data || [];
      const meta: Meta | null = payload.meta || null;

      setMeta(meta);
      setBoard(mapApplicantsToBoard(raw));
    } catch (err) {
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

  const handleSourceChange = (value: "twilio" | "providers") => {
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

  // 1) Contacted toggle → Jobs ⇄ Confirmed
  const handleToggleContacted = (id: string, value: boolean) => {
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
        await privateApi.post(
          `/api/v1/providers/jumpstart/twilio-applicants/${id}/contacted`,
          {
            contacted: value,
            agentId: agentId || undefined,
          }
        );
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
    // Forward move only: validate job exists
    if (value) {
      const applicant = findApplicant(board, id);
      const hasAgentJob =
        applicant?.agent_jobs && applicant.agent_jobs.length > 0;
      const hasJobId = !!applicant?.jobId;

      if (!hasAgentJob || !hasJobId) {
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
        await privateApi.post(
          `/api/v1/providers/jumpstart/twilio-applicants/${id}/mark-provider-post-job`,
          {
            post_job: value,
            agentId: agentId || undefined,
          }
        );
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
      const matchStatus = (applicant?.jumpstart?.match?.status || "") as string;
      const jobStatus = (applicant?.jobStatus || "") as string;

      const providerApproved =
        matchStatus === "provider_approved" ||
        matchStatus === "matched" ||
        jobStatus === "approved" ||
        jobStatus === "provider_approved";

      if (!providerApproved) {
        toast({
          variant: "destructive",
          title: "Provider not approved yet",
          description:
            "The provider has not approved this job post. Wait for approval before moving to Add payment.",
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

    // Forward move only: validate payment verified
    if (value) {
      const applicant = findApplicant(board, id);
      const paymentVerified = !!applicant?.jumpstart?.paymentVerified;

      if (!paymentVerified) {
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
  const handleDeleteSignup = (id: string) => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            "Delete this provider lead permanently? This cannot be undone."
          );

    if (!confirmed) return;

    // Optimistic: remove from board immediately
    removeApplicantFromBoard(id);

    (async () => {
      try {
        await privateApi.delete(`/api/v1/providers/jumpstart/twilio/${id}`);

        toast({
          title: "Lead deleted",
          description: "The Twilio signup has been removed permanently.",
        });
      } catch (err) {
        console.error("Failed to delete Twilio signup", err);
        setDragError("Failed to delete lead. Refreshing board.");
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
    <div className="flex flex-col h-full w-full px-4 md:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            KinsCare Agent Board
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track providers from SMS “YES” replies through to caregiver match.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Total leads:{" "}
            <span className="font-semibold text-slate-800">{totalCount}</span>
          </span>
          {meta && (
            <span className="text-xs text-slate-400">
              Page {meta.page} of {meta.pages}
            </span>
          )}
        </div>
      </div>

      {/* Filters + Legend */}
      <Card className="border border-slate-200 bg-white/80 backdrop-blur">
        <CardContent className="pt-4 pb-3 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <Input
                  placeholder="Search by email, phone or zipcode..."
                  className="pl-8 h-9 text-sm"
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <Select
                  value={filters.source}
                  onValueChange={(val: "twilio" | "providers") =>
                    handleSourceChange(val)
                  }
                >
                  <SelectTrigger className="h-9 w-40 text-xs">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio SMS</SelectItem>
                    <SelectItem value="providers">Non-SMS providers</SelectItem>
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
                  <SelectTrigger className="h-9 w-40 text-xs">
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
                    <SelectTrigger className="h-9 w-44 text-xs">
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
                    <SelectTrigger className="h-9 w-40 text-xs">
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
                className="h-8 text-xs"
                onClick={() => fetchApplicants()}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Unregistered provider</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Registered provider</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Has fresh job (&lt; 14 days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Payment needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600 ring-1 ring-emerald-200" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-md">
              {error}
            </div>
          )}
          {dragError && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md">
              {dragError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban board */}
      <div className="flex-1 min-h-[400px]">
        {loading ? (
          <div className="flex gap-4 overflow-x-auto max-w-7xl pb-2">
            {COLUMN_ORDER.map((col) => (
              <div key={col} className="w-[380px] shrink-0">
                <Card className="border-slate-200 bg-white/60">
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
          <div className="flex gap-4 overflow-x-auto max-w-7xl pb-2">
            {COLUMN_ORDER.map((colKey) => (
              <TwilioColumn
                key={colKey}
                columnKey={colKey}
                items={board[colKey]}
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
