"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApiClient } from "@/hooks/useApiClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, RefreshCcw } from "lucide-react";

type ReportEntry = {
  reporterId?: string;
  reportedUserId?: string;
  reason?: string;
  message?: string;
  createdAt?: string;
};

type ReportItem = {
  conversationSid?: string;
  uniqueName?: string;
  friendlyName?: string;
  lastReportedAt?: string;
  reports?: ReportEntry[];
};

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function ConversationReports() {
  const { privateApi } = useApiClient();
  const [items, setItems] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const flattened = useMemo(() => {
    const rows: (ReportEntry & {
      conversationSid?: string;
      friendlyName?: string;
      lastReportedAt?: string;
    })[] = [];
    items.forEach((item) => {
      (item.reports || []).forEach((report) => {
        rows.push({
          ...report,
          conversationSid: item.conversationSid,
          friendlyName: item.friendlyName,
          lastReportedAt: item.lastReportedAt,
        });
      });
    });
    return rows.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [items]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data } = await privateApi.get("/api/conversations/reports", {
        params: { page, limit },
      });
      if (!data?.success) {
        throw new Error(data?.message || "Failed to load reports.");
      }
      const payload = Array.isArray(data?.data) ? data.data : [];
      setItems(payload);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Conversation Reports
          </h2>
          <p className="text-sm text-slate-600">
            Review reported chats and decide next steps.
          </p>
        </div>
        <Button variant="outline" onClick={loadReports} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-4"
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && flattened.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-sm text-slate-500">
          No reports yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {flattened.map((report, index) => (
          <div
            key={`${report.conversationSid}-${report.createdAt}-${index}`}
            className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.35)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <Flag className="h-4 w-4" />
                </span>
                {report.friendlyName || "Conversation"}
              </div>
              <span className="text-xs text-slate-500">
                {formatDate(report.createdAt || report.lastReportedAt)}
              </span>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reason
                </p>
                <p className="mt-1 capitalize">{report.reason || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reported User
                </p>
                <p className="mt-1">{report.reportedUserId || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Reporter
                </p>
                <p className="mt-1">{report.reporterId || "—"}</p>
              </div>
            </div>
            {report.message ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                “{report.message}”
              </div>
            ) : null}
            {report.conversationSid ? (
              <p className="mt-3 text-xs text-slate-400">
                Conversation SID: {report.conversationSid}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-xs text-slate-500">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={flattened.length < limit}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
