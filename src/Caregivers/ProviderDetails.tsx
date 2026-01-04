"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Building2,
  Share2,
  ShieldCheck,
  Clock,
  Briefcase,
  LayoutGrid,
} from "lucide-react";

// --- If you use shadcn/ui, keep these imports. Otherwise, replace with your own primitives.
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiClient } from "@/hooks/useApiClient";
import Image from "next/image";

// --- Config
const PAGE_SIZE = 12;

// --- Types
type ProviderContactDetails = {
  complete?: boolean;
  verified?: boolean;
  payment_verified?: boolean;
  auth_mode?: string;
} | null;

type Provider = {
  userID?: string;
  name?: string;
  fname?: string;
  lname?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  profileImage?: string;
  trainer?: string; // "yes" | "no"
  type_of_setting?: string[];
  contactDetails?: ProviderContactDetails;
};

type Job = {
  _id: string;
  title: string;
  licenses?: string[];
  schedule?: string[];
  contacts?: {
    city?: string;
    address?: string;
    zipcode?: string;
    tel?: string;
    email?: string;
  };
  profileImage?: string;
};

type Pagination = {
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

type ProviderResponse = {
  success: boolean;
  provider: Provider;
  jobs: Job[];
  pagination: Pagination;
};

// --- Helpers
const initials = (name?: string) =>
  (name || "P")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatLocation = (p?: Provider | null) =>
  [p?.address, p?.city, p?.zipcode].filter(Boolean).join(", ");

const safeArr = <T,>(v: T[] | undefined | null): T[] => Array.isArray(v) ? v : [];

// --- Skeletons
const ProviderHeroSkeleton = () => (
  <div className="rounded-3xl overflow-hidden border border-slate-100 bg-white/80 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
    <div className="p-6 md:p-8">
      <div className="flex items-start gap-5">
        <Skeleton className="h-24 w-24 rounded-2xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 rounded-md" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

const JobCardSkeleton = () => (
  <Card className="border-slate-100 bg-white/80 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="flex-1">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-24 mt-2 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
    </CardContent>
  </Card>
);

// --- Small UI pieces
const StatPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 backdrop-blur px-4 py-3">
    <div className="rounded-xl p-2 bg-blue-50">
      <Icon className="h-5 w-5 text-blue-600" />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
    {children}
  </span>
);

// --- Job Card
const PostedJobCard = ({ job }: { job: Job }) => {
  const city = job?.contacts?.city || "";
  const zip = job?.contacts?.zipcode || "";
  return (
    <Link href={`/vitae/jobs/${job._id}`} className="group">
      <Card className="h-full transition-all border-slate-100 bg-white/80 shadow-sm hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="flex gap-3 mb-3 items-center">
            {job.profileImage ? (
              <Image
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-cover ring-1 ring-slate-200"
                src={job.profileImage}
                alt="company logo"
              />
            ) : (
              <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-slate-500" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {job.title}
              </p>
              <p className="text-xs text-slate-500">
                {zip}{zip && city ? ", " : ""}{city}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-wrap gap-2">
            {safeArr(job.licenses).slice(0, 2).map((lic, i) => (
              <Chip key={`lic-${i}`}>{lic}</Chip>
            ))}
            {safeArr(job.schedule).slice(0, 2).map((sch, i) => (
              <Chip key={`sch-${i}`}>{sch}</Chip>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// --- Pagination
const PaginationBar = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const arr: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
};

// --- MAIN COMPONENT
export default function ProviderDetailsClient({ providerId }: { providerId: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProviderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(params.get("limit") || String(PAGE_SIZE), 10));

  const abortRef = useRef<AbortController | null>(null);
  const { privateApi } = useApiClient();

  const fetchData = async (p: number, l: number) => {
    try {
      setLoading(true);
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const { data: json } = await privateApi.get(
        `/api/v1/caregivers/get-provider/${encodeURIComponent(providerId)}`,
        {
          params: { page: p, limit: l },
          signal: controller.signal,
        }
      );
      setData(json);
    } catch (e: any) {
      if (e.name === "AbortError") return; // ignore
      setError(e?.message || "Unable to load provider.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, page, limit]);

  useEffect(() => {
    if (data?.provider?.name) {
      document.title = `Provider: ${data.provider.name} — KinsCare`;
    }
  }, [data?.provider?.name]);

  const onPageChange = (next: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(next));
    sp.set("limit", String(limit));
    router.push(`?${sp.toString()}`);
    // fetchData will be triggered by effect on page change
  };

  // --- UI Pieces
  const provider = data?.provider || null;
  // console.log(provider, "provider details");
  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  // --- Top actions
  const shareProfile = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: provider?.name || "Provider", url });
      } else {
        await navigator.clipboard.writeText(url);
        // You can replace with toast if you use one globally
        alert("Profile link copied!");
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 xl:px-0 space-y-10">

        {/* HERO */}
        {loading ? (
          <ProviderHeroSkeleton />
        ) : error ? (
          <Card className="border-red-200 bg-red-50/70">
            <CardContent className="p-6">
              <p className="text-sm text-red-700">
                {error}
              </p>
              <div className="mt-4">
                <Button onClick={() => fetchData(page, limit)}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-white/80 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-5">
                  <Avatar className="h-24 w-24 rounded-2xl ring-1 ring-slate-200 shadow-sm">
                    <AvatarImage src={provider?.profileImage || ""} alt={provider?.name || "Provider"} />
                    <AvatarFallback className="text-lg bg-slate-900 text-white rounded-2xl">
                      {initials(provider?.name || [provider?.fname, provider?.lname].filter(Boolean).join(" "))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-[family:var(--header-font)] font-extrabold tracking-tight text-slate-900">
                        {provider?.name || [provider?.fname, provider?.lname].filter(Boolean).join(" ") || "Provider"}
                      </h1>
                      {provider?.contactDetails?.payment_verified && (
                        <span title="Payment Verified" className="inline-flex">
                          <BadgeCheck className="h-6 w-6 text-emerald-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {formatLocation(provider) || "Location not provided"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(provider?.type_of_setting) &&
                        provider!.type_of_setting!.slice(0, 4).map((s, i) => (
                          <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                            {s}
                          </Badge>
                        ))}
                      {provider?.trainer === "yes" && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Trainer Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="bg-white/80 border-slate-200"
                    asChild
                  >
                    <a
                      href={provider?.address ? `https://maps.google.com/?q=${encodeURIComponent(formatLocation(provider))}` : "#"}
                      target="_blank"
                      rel="noreferrer"
                      title="Open in Maps"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Directions
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/80 border-slate-200"
                    onClick={shareProfile}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatPill icon={Briefcase} label="Posted Jobs" value={pagination?.totalJobs ?? 0} />
                <StatPill icon={Clock} label="Auth Mode" value={provider?.contactDetails?.auth_mode || "—"} />
                <StatPill icon={BadgeCheck} label="Verified" value={provider?.contactDetails?.verified ? "Yes" : "No"} />
                <StatPill icon={LayoutGrid} label="Settings" value={safeArr(provider?.type_of_setting).length} />
              </div>
            </div>
          </div>
        )}

        {/* CONTACT CARD */}
        {!loading && !error && (
          <Card className="border-slate-100 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Contact</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {provider?.contactDetails?.verified ? "Request Phone" : "Request Phone"}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Provider
              </Button>
            </CardContent>
          </Card>
        )}

        {/* JOBS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Posted Jobs {loading ? "" : `(${jobs.length})`}
            </h3>
            {!loading && (
              <p className="text-xs text-slate-500">
                Page {pagination?.currentPage ?? 1} of {pagination?.totalPages ?? 1}
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <PostedJobCard key={job._id} job={job} />
                ))}
              </div>
              <PaginationBar
                page={pagination?.currentPage ?? 1}
                totalPages={pagination?.totalPages ?? 1}
                onPageChange={onPageChange}
              />
            </>
          ) : (
            <Card className="border-slate-100 bg-white/80 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-slate-600">
                  No jobs posted yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-6" />

        {/* FOOTNOTE */}
        <p className="text-xs text-slate-500 text-center">
          Profiles and listings are user-provided. Always verify credentials and details before hiring.
        </p>
      </div>
    </div>
  );
}
