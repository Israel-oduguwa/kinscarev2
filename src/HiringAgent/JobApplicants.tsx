"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, User } from "lucide-react";
import { fmtDate } from "./JobDetail";

const API_BASE = "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers";

export default function ApplicantsTab({ jobId }: { jobId: string }) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [appPage, setAppPage] = useState(1);
  const [appLimit] = useState(10);
  const [appTotal, setAppTotal] = useState(0);

  const fetchApplicants = async (page = 1) => {
    if (!jobId) return;
    setAppLoading(true);
    setAppError(null);
    try {
      const res = await axios.get(
        `${API_BASE}/jumpstart/job/${jobId}/applicants`,
        { params: { page, limit: appLimit } }
      );
      const data = res.data?.data || [];
      setApplicants(data);
      setAppTotal(res.data?.pagination?.total || 0);
      setAppPage(page);
    } catch (e: any) {
      setAppError(
        e?.response?.data?.error || e?.message || "Failed to load applicants."
      );
    } finally {
      setAppLoading(false);
    }
  };

  // Lazy: loads when this tab mounts
  useEffect(() => {
    fetchApplicants(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return (
    <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">Applicants</CardTitle>
        <CardDescription>Candidates who applied to this job</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Control bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            Showing page <span className="font-medium">{appPage}</span>{" "}
            {appTotal ? (
              <span>
                of <span className="font-medium">{Math.ceil(appTotal / appLimit)}</span>
              </span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchApplicants(Math.max(1, appPage - 1))}
              disabled={appLoading || appPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchApplicants(appPage + 1)}
              disabled={appLoading || appPage * appLimit >= appTotal}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Internal scroll container */}
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {appLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border bg-white flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              ))}
            </div>
          ) : appError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{appError}</AlertDescription>
            </Alert>
          ) : applicants.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No applicants yet.</div>
          ) : (
            <div className="space-y-3">
              {applicants.map((a: any, idx: number) => {
                const name =
                  a?.name ||
                  `${a?.profile?.firstName || ""} ${a?.profile?.lastName || ""}`.trim() ||
                  "Applicant";
                const lic = Array.isArray(a?.licenses)
                  ? a.licenses
                  : Array.isArray(a?.profile?.licenses)
                  ? a.profile.licenses
                  : [];
                const avail = Array.isArray(a?.availability)
                  ? a.availability
                  : Array.isArray(a?.profile?.availability)
                  ? a.profile.availability
                  : [];
                const cityStateZip = [a?.profile?.city, a?.profile?.state, a?.profile?.zipcode]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    key={a?.userID || idx}
                    className="p-4 rounded-xl border bg-white flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{name}</div>
                        <div className="text-xs text-slate-600">{cityStateZip || "—"}</div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2">
                      {avail.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {lic.map((l: string) => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-slate-500">Applied {fmtDate(a?.applied_on)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
