"use client";

import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, RefreshCw, AlertTriangle, MapPin, Calendar, Users, Filter, Plus } from "lucide-react";

type JobDoc = {
  _id: string | { $oid?: string };
  title?: string;
  created?: string | Date;
  claimed?: boolean;
  schedule?: string[];
  licenses?: string[];
  contacts?: { zipcode?: string; state?: string; city?: string };
};

const API_BASE = ""https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers";

function toIdString(id: any): string {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (id?.$oid) return String(id.$oid);
  return String(id);
}

function fmtDate(d?: string | Date | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return String(d);
  }
}

export default function AllJobs() {
 const {userData} = useAuthContext();
  const agentUserID = useMemo(
    () => userData?.userID || userData?._id || userData?.id || null,
    [userData]
  );

  const [jobs, setJobs] = useState<JobDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const fetchJobs = async (opts?: { silent?: boolean }) => {
    if (!agentUserID) return;
    if (!opts?.silent) setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE}/jumpstart/agent-jobs`, {
        params: {
          agentUserID: agentUserID,
          scope: "owned",
          page,
          limit,
        },
      });
      setJobs(res.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [agentUserID, page]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs({ silent: true });
  };

  // Stats calculations
  const totalJobs = jobs.length;
  const claimedJobs = jobs.filter(job => job.claimed).length;
  const activeJobs = jobs.filter(job => !job.claimed).length;

  if (!agentUserID) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Agent user ID not found. Please sign in as an agent to view your jobs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Your Job Posts
              </h1>
              <p className="text-slate-600 mt-1">
                Manage and track all jobs posted under your agent account
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing || loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

     

      {/* Main Content Card */}
      <Card className="border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                Job Listings
                {!loading && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Jobs posted with <span className="font-medium text-slate-700">your agent ID</span>. Applications route directly to you.
              </CardDescription>
            </div>
            
            
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-slate-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-3 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    </div>
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">No jobs posted yet</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                You haven't created any job posts yet. Start by posting your first job to find qualified caregivers.
              </p>
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                <Plus className="h-5 w-5" />
                Create Your First Job
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {jobs.map((job) => {
                const id = toIdString((job as any)._id);
                const created = fmtDate(job.created);
                const schedule = Array.isArray(job.schedule) ? job.schedule : [];
                const licenses = Array.isArray(job.licenses) ? job.licenses : [];
                const loc =
                  job?.contacts?.city ||
                  job?.contacts?.state ||
                  job?.contacts?.zipcode
                    ? `${job?.contacts?.city ? job.contacts.city + ", " : ""}${job?.contacts?.state || ""} ${job?.contacts?.zipcode || ""}`.trim()
                    : "—";

                return (
                  <Card key={id} className="border-slate-200 bg-white hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                            {job.title || "Untitled Job"}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span>{created}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="truncate">{loc}</span>
                            </div>
                          </div>

                          {job.claimed && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 mb-3">
                              ✓ Claimed
                            </Badge>
                          )}
                        </div>
                        
                        {id ? (
                          <Link href={`/agent/jobs/${id}`} className="shrink-0">
                            <Button size="sm" variant="outline" className="whitespace-nowrap">
                              View Details
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled>View Details</Button>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="space-y-3">
                        {schedule.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {schedule.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-0">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {licenses.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {licenses.map((l) => (
                              <Badge key={l} variant="outline" className="text-xs border-slate-300 text-slate-700">
                                {l}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && jobs.length > 0 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {jobs.length} jobs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  size="sm"
                >
                  Previous
                </Button>
                <div className="text-sm text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
                  Page {page}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}