"use client";

import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/hooks/useApiClient";

type MetricsResponse = {
  ok: boolean;
  data: {
    timeSpentPerStage: {
      flowState: string;
      avgDurationMs: number;
      samples: number;
    }[];
    conversionByEntryTrigger: {
      entryTrigger: string;
      total: number;
      matched: number;
      conversionRate: number;
    }[];
    agentConversionRate: {
      agentId: string;
      touchedFlows: number;
      matchedFlows: number;
      conversionRate: number;
    }[];
    avgTimeToMatchMs: number | null;
    avgTimeToFirstContactMs: number | null;
    contactRate24h: number | null;
    qualificationRate: number | null;
    paymentConversionRate: number | null;
    agentWorkload: {
      agentId: string;
      activeFlows: number;
    }[];
    dropoffStage: {
      flowState: string;
      count: number;
    }[];
    dropoffReasons: {
      reason: string;
      count: number;
    }[];
  };
};

function formatFlowState(value?: string | null) {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatEntryTrigger(value?: string | null) {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatAgentLabel(agentId?: string | null) {
  if (!agentId) return "Agent";
  const last = agentId.slice(-4);
  return `Agent •${last}`;
}

function formatReason(value?: string | null) {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDurationShort(ms?: number | null) {
  if (!ms || ms <= 0) return "—";
  const hours = ms / 36e5;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  return `${days.toFixed(days < 10 ? 1 : 0)}d`;
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 100)}%`;
}

export default function JumpstartMetrics() {
  const { privateApi } = useApiClient();
  const [metrics, setMetrics] = React.useState<MetricsResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await privateApi.get(
          "/api/v1/providers/jumpstart/metrics"
        );
        if (!cancelled) {
          setMetrics(res?.data?.data || null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load metrics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchMetrics();
    return () => {
      cancelled = true;
    };
  }, [privateApi]);

  const timeStageData = React.useMemo(() => {
    const base = metrics?.timeSpentPerStage || [];
    return base.map((item) => ({
      stage: formatFlowState(item.flowState),
      value: Math.round((item.avgDurationMs / 36e5) * 10) / 10,
      samples: item.samples,
    }));
  }, [metrics]);

  const entryConversionData = React.useMemo(() => {
    const base = metrics?.conversionByEntryTrigger || [];
    return base.map((item) => ({
      trigger: formatEntryTrigger(item.entryTrigger),
      value: Math.round(item.conversionRate * 100),
      total: item.total,
      matched: item.matched,
    }));
  }, [metrics]);

  const agentConversionData = React.useMemo(() => {
    const base = metrics?.agentConversionRate || [];
    return base.map((item) => ({
      agent: formatAgentLabel(item.agentId),
      value: Math.round(item.conversionRate * 100),
      touched: item.touchedFlows,
      matched: item.matchedFlows,
    }));
  }, [metrics]);

  const agentWorkloadData = React.useMemo(() => {
    const base = metrics?.agentWorkload || [];
    return base.map((item) => ({
      agent: formatAgentLabel(item.agentId),
      value: item.activeFlows,
    }));
  }, [metrics]);

  const dropoffData = React.useMemo(() => {
    const base = metrics?.dropoffStage || [];
    return base.map((item) => ({
      stage: formatFlowState(item.flowState),
      value: item.count,
    }));
  }, [metrics]);

  const dropoffReasonData = React.useMemo(() => {
    const base = metrics?.dropoffReasons || [];
    return base.map((item) => ({
      reason: formatReason(item.reason),
      value: item.count,
    }));
  }, [metrics]);

  const topDropoff = React.useMemo(() => {
    if (!metrics?.dropoffStage?.length) return null;
    return [...metrics.dropoffStage].sort((a, b) => b.count - a.count)[0];
  }, [metrics]);

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/70 bg-white/80 backdrop-blur shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Jumpstart Flow Metrics</CardTitle>
          <CardDescription>
            Track the health of the pipeline across stages, sources, and agents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 mt-2" />
                  <Skeleton className="h-3 w-28 mt-3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-sm text-rose-600">{error}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Avg time to match
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {formatDurationShort(metrics?.avgTimeToMatchMs)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Intake to matched
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Avg time to first contact
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {formatDurationShort(metrics?.avgTimeToFirstContactMs)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Flow created to agent call
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Contacted within 24h
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {formatPercent(metrics?.contactRate24h)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Reached providers quickly
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Qualification rate
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {formatPercent(metrics?.qualificationRate)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Reached intake complete
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Payment conversion
                </p>
                <p className="text-2xl font-semibold text-slate-900 mt-2">
                  {formatPercent(metrics?.paymentConversionRate)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Payment captured rate
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Top drop-off
                </p>
                <p className="text-base font-semibold text-slate-900 mt-2">
                  {formatFlowState(topDropoff?.flowState)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {topDropoff?.count ?? "—"} stalled flows
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Time Spent Per Stage</CardTitle>
            <CardDescription>
              Average hours spent in each stage (sample size shown in tooltip).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer
                className="h-56 w-full"
                config={{
                  value: {
                    label: "Avg hours",
                    color: "#2563eb",
                  },
                }}
              >
                <AreaChart data={timeStageData} margin={{ left: -8, right: 8 }}>
                  <defs>
                    <linearGradient id="stageArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="stage"
                        labelKey="stage"
                        formatter={(value, name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {item.payload.stage}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {value}h · {item.payload.samples} samples
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="url(#stageArea)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conversion By Entry Trigger</CardTitle>
            <CardDescription>
              Percentage of flows that reach matched by entry source.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer
                className="h-56 w-full"
                config={{
                  value: {
                    label: "Conversion rate",
                    color: "#14b8a6",
                  },
                }}
              >
                <AreaChart data={entryConversionData} margin={{ left: -8, right: 8 }}>
                  <defs>
                    <linearGradient
                      id="entryArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="trigger"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="trigger"
                        labelKey="trigger"
                        formatter={(value, name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {item.payload.trigger}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {value}% · {item.payload.matched}/{item.payload.total}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#14b8a6"
                    fill="url(#entryArea)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Agent Conversion Rate</CardTitle>
            <CardDescription>
              Share of touched flows that reach matched per agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer
                className="h-56 w-full"
                config={{
                  value: {
                    label: "Conversion rate",
                    color: "#6366f1",
                  },
                }}
              >
                <AreaChart data={agentConversionData} margin={{ left: -8, right: 8 }}>
                  <defs>
                    <linearGradient
                      id="agentConversionArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="agent"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="agent"
                        labelKey="agent"
                        formatter={(value, name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {item.payload.agent}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {value}% · {item.payload.matched}/{item.payload.touched}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="url(#agentConversionArea)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Drop-off Stage</CardTitle>
            <CardDescription>
              Where flows are most likely to stall.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer
                className="h-56 w-full"
                config={{
                  value: {
                    label: "Drop-off count",
                    color: "#f97316",
                  },
                }}
              >
                <BarChart data={dropoffData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="stage"
                        labelKey="stage"
                        formatter={(value, name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {item.payload.stage}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {value} flows
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Agent Workload</CardTitle>
            <CardDescription>
              Active flows touched in the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer
                className="h-56 w-full"
                config={{
                  value: {
                    label: "Active flows",
                    color: "#0ea5e9",
                  },
                }}
              >
                <BarChart data={agentWorkloadData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="agent"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="agent"
                        labelKey="agent"
                        formatter={(value, name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {item.payload.agent}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {value} active flows
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/70 bg-white/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Drop-off Reasons</CardTitle>
            <CardDescription>
              Most common closure reasons for stalled flows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <ChartContainer
                className="h-56 w-full"
                config={{
                  value: {
                    label: "Drop-off count",
                    color: "#f43f5e",
                  },
                }}
              >
                <BarChart data={dropoffReasonData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="reason"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="reason"
                        labelKey="reason"
                        formatter={(value, name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {item.payload.reason}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {value} flows
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
