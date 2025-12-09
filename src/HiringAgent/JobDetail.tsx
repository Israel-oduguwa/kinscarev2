"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  RefreshCw,
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Clock,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicantsTab from "./JobApplicants";
import RecommendedTab from "./JobRecommended";
import ProviderApproveJobButton from "./ProviderApproveJobButton";

// NEW: split components

const API_BASE =
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers";

export function fmtDate(d?: string | Date | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}

export default function JobDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const requesterId = searchParams.get("requesterId") || undefined;

  // ---- Job state ----
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const schedule = useMemo(
    () => (Array.isArray(job?.schedule) ? job.schedule : []),
    [job]
  );
  const licenses = useMemo(
    () => (Array.isArray(job?.licenses) ? job.licenses : []),
    [job]
  );
  const days = useMemo(() => (Array.isArray(job?.days) ? job.days : []), [job]);
  const location = useMemo(() => {
    const c = job?.contacts || {};
    const city = c.city ? `${c.city}, ` : "";
    const state = c.state || "";
    const zip = c.zipcode ? ` ${c.zipcode}` : "";
    const s = `${city}${state}${zip}`.trim();
    return s.length ? s : "—";
  }, [job]);

  const fetchJob = async (opts?: { silent?: boolean }) => {
    if (!id) return;
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/jumpstart/agent-jobs/${id}`, {
        params: requesterId ? { requesterId } : {},
      });
      setJob(res.data?.data || null);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to load job.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJob({ silent: true });
  };

  // ---------- Loading / Error / Empty Job ----------
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Job not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isClaimed = !!job.claimed;
  const createdAt = fmtDate(job.created);
  const applicantLinkId = job?.agentMeta?.applicantId || null;
  const paymentLink = `https://www.kinscare.org/add-payment/${job?.agentMeta?.applicantId}`;
  const jobIdString =
    typeof job?._id === "string" ? job._id : job?._id?.toString?.() ?? "";
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {job.title || "Untitled Job"}
              </h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Created {createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isClaimed ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm">
                    {isClaimed ? "Claimed" : "Available"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
              <Clock className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                {schedule.length} Schedule Types
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                {licenses.length} Licenses
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
              <User className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                {days.length} Days
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!job?.approved ? (
            <ProviderApproveJobButton
              initialApproved={job.status === "provider_approved"}
              initialPaymentLink={paymentLink}
              phoneNumber={job?.contacts?.tel}
              // existingAccount={job.existingAccount}
              jobId={jobIdString}
            />
          ) : (
            <Button disabled className="w-full rounded-xl px-5 py-2.5">
              Approved
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* ---- Tabs: Overview | Applicants | Recommended ---- */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        {/* ============= OVERVIEW TAB ============= */}
        <TabsContent value="overview">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description Card */}
              <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tags Section */}
                  <div className="space-y-4">
                    {schedule.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Schedule Type
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {schedule.map((s: string) => (
                            <Badge
                              key={s}
                              className="bg-blue-50 text-blue-700 border-0 text-sm"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {licenses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Required Licenses
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {licenses.map((l: string) => (
                            <Badge
                              key={l}
                              variant="secondary"
                              className="text-sm border-0 bg-slate-100 text-slate-700"
                            >
                              {l}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {days.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Working Days
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="text-sm bg-white text-slate-700"
                          >
                            {days.join(", ")}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description Content */}
                  <div className="prose max-w-none">
                    {job.description ? (
                      <div
                        className="prose-sm md:prose prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                      />
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p>No description provided for this job.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Location Information */}
              <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Contact & Location
                  </CardTitle>
                  <CardDescription>
                    Provider contact information and job location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900">
                        Contact Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Email
                            </p>
                            <p className="text-slate-900">
                              {job?.contacts?.email || "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Phone
                            </p>
                            <p className="text-slate-900">
                              {job?.contacts?.tel || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900">
                        Job Location
                      </h4>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            Location
                          </p>
                          <p className="text-slate-900">{location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Meta Information */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    Job Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl ${
                      isClaimed
                        ? "bg-green-50 border border-green-200"
                        : "bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isClaimed ? "bg-green-100" : "bg-amber-100"
                      }`}
                    >
                      {isClaimed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {isClaimed ? "Claimed" : "Available"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {isClaimed
                          ? "This job has been claimed by a provider"
                          : "Waiting for provider to claim"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Owner ID</span>
                      <span className="font-medium text-slate-900">
                        {job.userID || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">Claimed By</span>
                      <span className="font-medium text-slate-900">
                        {job.claimedBy || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-600">Claimed At</span>
                      <span className="font-medium text-slate-900">
                        {fmtDate(job.claimedAt)}
                      </span>
                    </div>
                  </div>

                  {applicantLinkId && (
                    <div className="pt-4 border-t border-slate-100">
                      <Link href={`/agent/twilio/provider/${applicantLinkId}`}>
                        <Button
                          variant="outline"
                          className="w-full flex items-center gap-2"
                        >
                          <LinkIcon className="h-4 w-4" />
                          View Linked Applicant
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Provider Information */}
              <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <User className="h-5 w-5 text-indigo-600" />
                    Provider Details
                  </CardTitle>
                  <CardDescription>SMS lead information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job?.pendingProvider ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Name</span>
                        <span className="font-medium text-slate-900">
                          {`${job.pendingProvider.firstName || ""} ${
                            job.pendingProvider.lastName || ""
                          }`.trim() || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Email</span>
                        <span className="font-medium text-slate-900">
                          {job.pendingProvider.email || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Phone</span>
                        <span className="font-medium text-slate-900">
                          {job.pendingProvider.tel || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">Location</span>
                        <span className="font-medium text-slate-900 text-right">
                          {[
                            job.pendingProvider.city,
                            job.pendingProvider.state,
                            job.pendingProvider.zipcode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <User className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>No provider information available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agent Information */}
              <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Building2 className="h-5 w-5 text-slate-600" />
                    Agent Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Created By</span>
                    <span className="font-medium text-slate-900">
                      {job?.agentMeta?.createdBy || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Agent ID</span>
                    <span className="font-medium text-slate-900">
                      {job?.agentMeta?.agentUserID || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Source</span>
                    <span className="font-medium text-slate-900">
                      {job?.agentMeta?.createdFrom || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Created At</span>
                    <span className="font-medium text-slate-900">
                      {fmtDate(job?.agentMeta?.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============= APPLICANTS TAB ============= */}
        <TabsContent value="applicants">
          <ApplicantsTab jobId={id} />
        </TabsContent>

        {/* ============= RECOMMENDED TAB ============= */}
        <TabsContent value="recommended">
          <RecommendedTab jobId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
