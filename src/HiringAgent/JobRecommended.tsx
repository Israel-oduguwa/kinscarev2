"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  User,
  X,
  Filter,
  MapPin,
  Calendar,
  Award,
  Star,
  Search,
  Users,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProfileAvatar from "@/components/ProfileAvatar";


const API_BASE =
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers";

const groupLicenses = [
  { label: "CNA", value: "CNA or NAC" },
  { label: "HCA", value: "HCA" },
  { label: "NAR", value: "NAR" },
  { label: "Companion", value: "None" },
];

const groupSchedule = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "on Call" },
  { label: "Live In", value: "Live In" },
];

type Option = { label: string; value: string };

function MultiSelectBox({
  label,
  options,
  values,
  onChange,
  maxHeight = 220,
}: {
  label: string;
  options: Option[];
  values: string[];
  onChange: (next: string[]) => void;
  maxHeight?: number;
}) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div
          className="max-h-[220px] overflow-y-auto divide-y divide-slate-100"
          style={{ maxHeight }}
        >
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                values.includes(opt.value)
                  ? "bg-blue-50 border-l-2 border-l-blue-500"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => toggle(opt.value)}
            >
              <div
                className={`h-4 w-4 rounded border flex items-center justify-center transition-all duration-200 ${
                  values.includes(opt.value)
                    ? "bg-blue-500 border-blue-500"
                    : "border-slate-300 bg-white"
                }`}
              >
                {values.includes(opt.value) && (
                  <div className="h-2 w-2 bg-white rounded-sm" />
                )}
              </div>
              <span className="text-sm text-slate-800 font-medium">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => {
            const found = options.find((o) => o.value === v);
            return (
              <Badge
                key={v}
                className="bg-blue-100 text-blue-800 border-0 text-xs font-medium"
              >
                {found?.label || v}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RecommendedTab({ jobId }: { jobId: string }) {
  const [recs, setRecs] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [recLimit] = useState(20);

  const [licenses, setLicenses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [zipcode, setZipcode] = useState<string>("");

  const [applied, setApplied] = useState<{
    licenses: string[];
    availability: string[];
    zipcode: string;
  }>({ licenses: [], availability: [], zipcode: "" });

  const buildParams = useMemo(() => {
    return (opts?: {
      licenses?: string[];
      availability?: string[];
      zipcode?: string;
      limit?: number;
    }) => {
      const params = new URLSearchParams();
      const L = (opts?.licenses || []).filter(Boolean);
      const A = (opts?.availability || []).filter(Boolean);
      const Z = (opts?.zipcode || "").trim();

      (opts?.limit ? opts.limit : recLimit) &&
        params.append("limit", String(opts?.limit || recLimit));
      L.forEach((l) => params.append("licenses", l));
      A.forEach((a) => params.append("availability", a));
      if (Z) params.append("zipcode", Z);

      return params;
    };
  }, [recLimit]);

  const fetchRecs = async (useCurrentFilters = false) => {
    if (!jobId) return;
    setRecLoading(true);
    setRecError(null);
    try {
      const params = buildParams(
        useCurrentFilters
          ? { licenses, availability, zipcode, limit: recLimit }
          : { limit: recLimit }
      );
      const url = `${API_BASE}/jumpstart/job/${jobId}/recommended-caregivers?${params.toString()}`;
      const res = await axios.get(url);
      setRecs(res.data?.data || []);
    } catch (e: any) {
      setRecError(
        e?.response?.data?.error ||
          e?.message ||
          "Failed to load recommended caregivers."
      );
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs(false);
  }, [jobId]);

  const onApply = () => {
    setApplied({ licenses, availability, zipcode });
    fetchRecs(true);
  };

  const onReset = () => {
    setLicenses([]);
    setAvailability([]);
    setZipcode("");
    setApplied({ licenses: [], availability: [], zipcode: "" });
    fetchRecs(false);
  };

  const hasActiveFilters =
    applied.licenses.length > 0 ||
    applied.availability.length > 0 ||
    !!applied.zipcode.trim();

  const labelFor = (arr: string[], dict: Option[]) =>
    arr.map((v) => dict.find((d) => d.value === v)?.label || v).filter(Boolean);

  const appliedLicenseLabels = labelFor(applied.licenses, groupLicenses);
  const appliedAvailabilityLabels = labelFor(
    applied.availability,
    groupSchedule
  );

  return (
    <Card className="bg-white/50 backdrop-blur-sm shadow-sm border-0">
      <CardHeader className="pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              Recommended Caregivers
            </CardTitle>
            <CardDescription className="text-base">
              Find the perfect match based on licenses, availability, and
              location
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onReset}
              disabled={recLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Reset All
            </Button>
            <Button
              onClick={onApply}
              disabled={recLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
              {recLoading ? "Searching..." : "Find Matches"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Filter Section */}
        <div className="space-y-6">
          {/* <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Refine Your Search
            </h3>
          </div> */}

          <div className="grid gap-6 md:grid-cols-3">
            <MultiSelectBox
              label="Required Licenses"
              options={groupLicenses}
              values={licenses}
              onChange={setLicenses}
            />
            <MultiSelectBox
              label="Availability Schedule"
              options={groupSchedule}
              values={availability}
              onChange={setAvailability}
            />
            <div className="w-full space-y-3">
              <div className="text-sm font-semibold text-slate-800">
                Location Preference
              </div>
              <div className="space-y-2">
                <input
                  inputMode="numeric"
                  placeholder="Enter zip code (e.g., 98118)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  Leave blank to use job location. We'll find caregivers within
                  a 50-mile radius.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="h-4 w-4" />
              Active Filters
            </div>
            <div className="flex flex-wrap gap-2">
              {appliedLicenseLabels.map((lbl) => (
                <Badge
                  key={`L-${lbl}`}
                  className="bg-blue-100 text-blue-800 border-0 px-3 py-1.5"
                >
                  <Award className="h-3 w-3 mr-1.5" />
                  {lbl}
                  <X
                    className="h-3.5 w-3.5 ml-1.5 cursor-pointer hover:text-blue-900"
                    onClick={() => {
                      const next = applied.licenses.filter(
                        (v) =>
                          (groupLicenses.find((g) => g.label === lbl)?.value ||
                            lbl) !== v
                      );
                      setLicenses(next);
                      setApplied({ ...applied, licenses: next });
                      fetchRecs(true);
                    }}
                  />
                </Badge>
              ))}
              {appliedAvailabilityLabels.map((lbl) => (
                <Badge
                  key={`A-${lbl}`}
                  className="bg-green-100 text-green-800 border-0 px-3 py-1.5"
                >
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {lbl}
                  <X
                    className="h-3.5 w-3.5 ml-1.5 cursor-pointer hover:text-green-900"
                    onClick={() => {
                      const val =
                        groupSchedule.find((g) => g.label === lbl)?.value ||
                        lbl;
                      const next = applied.availability.filter(
                        (v) => v !== val
                      );
                      setAvailability(next);
                      setApplied({ ...applied, availability: next });
                      fetchRecs(true);
                    }}
                  />
                </Badge>
              ))}
              {applied.zipcode && (
                <Badge className="bg-orange-100 text-orange-800 border-0 px-3 py-1.5">
                  <MapPin className="h-3 w-3 mr-1.5" />
                  ZIP: {applied.zipcode}
                  <X
                    className="h-3.5 w-3.5 ml-1.5 cursor-pointer hover:text-orange-900"
                    onClick={() => {
                      setZipcode("");
                      setApplied({ ...applied, zipcode: "" });
                      fetchRecs(true);
                    }}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Matching Caregivers
              </h3>
              {!recLoading && (
                <Badge variant="secondary" className="text-sm">
                  {recs.length} {recs.length === 1 ? "match" : "matches"} found
                </Badge>
              )}
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {recLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-slate-200 bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-3 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
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
            ) : recError ? (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800">
                  {recError}
                </AlertDescription>
              </Alert>
            ) : recs.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No matches found
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "Try adjusting your filters to find more caregivers."
                    : "No caregivers match your current criteria. Try broadening your search."}
                </p>
                {hasActiveFilters && (
                  <Button onClick={onReset} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recs.map((u: any, idx: number) => {
                  const name =
                    u?.fullName ||
                    `${u?.fname || ""} ${u?.lname || ""}`.trim() ||
                    "Caregiver";
                  const lic = Array.isArray(u?.licenses) ? u.licenses : [];
                  // console.log(u)
                  const avail = Array.isArray(u?.availability)
                    ? u.availability
                    : [];
                  const phone =
                    u?.tel ||
                    u?.phone ||
                    u?.auth?.tel ||
                    u?.settings?.tel ||
                    null;
                  const loc = [u?.city, u?.state, u?.zipcode]
                    .filter(Boolean)
                    .join(", ");

                  if (!phone) {
                    return null;
                  }

                  return (
                    <Card
                      key={u?.userID || idx}
                      className="border-slate-200 bg-white hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <ProfileAvatar
                              size="w-11 h-11"
                              name={`${u?.fname} ${u?.lname}`}
                              profileImage={u?.profileImage}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-semibold text-slate-900 truncate">
                                  {name}
                                </h4>
                                {u?.matchScore && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                    <Star className="h-3 w-3 fill-blue-600 text-blue-600" />
                                    {Math.round(u.matchScore * 100)}%
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 space-y-1 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  <span className="truncate">
                                    {loc || "Location not specified"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-slate-400" />
                                  <span>{phone || "Phone not available"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Link href={`/agent/caregiver/${u?.userID}`}>
                              <Button size="sm" className="text-xs">
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {(avail.length > 0 || lic.length > 0) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                            {avail.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {avail.map((s: string) => (
                                  <Badge
                                    key={s}
                                    className="bg-emerald-50 text-emerald-700 border-0 text-xs"
                                  >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {lic.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {lic.map((l: string) => (
                                  <Badge
                                    key={l}
                                    variant="outline"
                                    className="text-xs border-blue-200 text-blue-700 bg-blue-50"
                                  >
                                    <Award className="h-3 w-3 mr-1" />
                                    {l}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
