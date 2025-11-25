/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import {
  AlertTriangle,
  Briefcase,
  ClipboardList,
  DollarSign,
  Layers,
  Lightbulb,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/** Types */
type JobSummary = {
  job_title: string;
  average_salary: string;
  job_openings?: string;
  market_trend: string;
  professional_tips: string[];
  career_outlook?: string;
};

type CoursePlan = {
  licenses?: string[];
  prerequisite?: string[];
  requirement?: string[];
  points?: number;
};

type WorkExpItem = {
  role?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
};

/** ---------- Client Cache Helpers ---------- */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const cacheKey = (userId: string) => `kinscare:jobSummary:${userId}`;

function readCache(userId?: string) {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const { data, savedAt } = JSON.parse(raw);
    if (!savedAt || Date.now() - savedAt > CACHE_TTL_MS) return null;
    return data as JobSummary;
  } catch {
    return null;
  }
}

function writeCache(userId?: string, data?: JobSummary) {
  if (!userId || !data || typeof window === "undefined") return;
  try {
    localStorage.setItem(
      cacheKey(userId),
      JSON.stringify({ data, savedAt: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

function ProfessionProfile({ userData, user }: any) {
  const [jobSummary, setJobSummary] = useState<JobSummary | null>(
    userData?.jobSummary || null
  );
  const [loading, setLoading] = useState(!userData?.jobSummary);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false); // UI-only
  const {contactData} = useAuthContext();
  const {privateApi} = useApiClient();

  /** ---------- Helpers (unchanged) ---------- */
  const isDataStale = (lastSummaryUpdated?: string): boolean => {
    if (!lastSummaryUpdated) return true;
    const oneDay = 24 * 60 * 60 * 1000;
    const last = new Date(lastSummaryUpdated).getTime();
    return Date.now() - last > oneDay;
  };

  const safeParseJson = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(content.slice(start, end + 1));
        } catch {}
      }
      throw new Error("Failed to parse AI JSON");
    }
  };

  const extractTitleFromRecommendationPhrase = (
    phrase?: string
  ): string | null => {
    if (!phrase) return null;
    const lower = phrase.toLowerCase();
    const startKey = "pursuing a ";
    const endKey = " certification";
    const sIdx = lower.indexOf(startKey);
    const eIdx = lower.indexOf(endKey, sIdx + startKey.length);
    if (sIdx === -1 || eIdx === -1) return null;

    const core = phrase
      .slice(sIdx + startKey.length, eIdx)
      .replace(/[^a-zA-Z0-9/ ,\-]/g, " ")
      .trim();

    const parts = core
      .split(/\s+or\s+|,\s*/i)
      .map((p) => p.trim())
      .filter(Boolean);

    return parts[0] || null;
  };

  /** Build seed (unchanged logic) */
  /** Build seed (robust + complete if ANY source exists) */
  const seed = useMemo(() => {
    // Pull from either userData.customData or contactData
    const custom = (userData?.customData ?? contactData) || {};
    const recPhrase: string | undefined =
      custom?.recommendations?.recommendationPhrase;
    const careerPathExplicit: string | undefined = custom?.careerPath;

    // App state sources
    const coursePlan: CoursePlan = userData?.careerProfile?.coursePlan ?? {};
    const experiences: WorkExpItem[] =
      userData?.careerProfile?.experience?.workExperiences ?? [];

    // Legacy fallbacks
    const legacyRecTitle: string | undefined =
      userData?.recommendation?.[0]?.title;
    const legacyInstitution: string | undefined =
      userData?.recommendation?.[0]?.institution;

    // Try to get a title from the phrase
    const titleFromPhrase =
      extractTitleFromRecommendationPhrase(recPhrase) || undefined;

    // Fallbacks from course plan and experience
    const titleFromPlan =
      coursePlan?.licenses?.[0] ||
      coursePlan?.prerequisite?.[0] ||
      coursePlan?.requirement?.[0] ||
      undefined;

    const titleFromExperience = experiences?.[0]?.role || undefined;

    // Final title priority
    const title =
      careerPathExplicit ||
      titleFromPhrase ||
      titleFromPlan ||
      titleFromExperience ||
      legacyRecTitle ||
      "";

    // Consider it "complete" if ANY meaningful source exists
    const hasAnySource =
      Boolean(careerPathExplicit) ||
      Boolean(titleFromPhrase) ||
      Boolean(titleFromPlan) ||
      Boolean(titleFromExperience) ||
      Boolean(legacyRecTitle) ||
      Boolean(coursePlan?.licenses?.length) ||
      Boolean(coursePlan?.prerequisite?.length) ||
      Boolean(coursePlan?.requirement?.length) ||
      Boolean(experiences?.length);

    if (!hasAnySource) {
      return { title: "", institution: "", incomplete: true as const };
    }

    return {
      title,
      institution: legacyInstitution || "",
      incomplete: false as const,
    };
  }, [user, userData]);

  /** ---------- Effects with cache short-circuit ---------- */
  useEffect(() => {
    if (!userData) return;

    // 0) Try client cache first (hard stop if fresh)
    const cached = readCache(userData.userID);
    if (cached) {
      setJobSummary(cached);
      setLoading(false);
      return; // skip DB/AI entirely
    }

    const shouldFetch =
      !jobSummary || isDataStale(userData?.lastSummaryUpdated);

    if (shouldFetch) {
      if (seed?.incomplete) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }
      fetchJobSummary();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, seed?.title, seed?.institution]);

  /** ---------- IO (unchanged contract) ---------- */
  const saveToDatabase = async (summary: JobSummary) => {
    try {
      await privateApi.post("/api/v1/auth/crud-operation", {
        collectionName: "users",
        operation: "updateOne",
        filter: { userID: userData.userID },
        update: {
          $set: {
            jobSummary: summary,
            lastSummaryUpdated: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Error saving job summary:", error);
    }
  };

  const fetchJobSummary = async () => {
    try {
      setLoading(true);

      // 1) DB check
      const dbResp = await privateApi.post(
        "/api/v1/auth/crud-operation",
        {
          collectionName: "users",
          operation: "findOne",
          filter: { userID: userData.userID },
          projection: { jobSummary: 1, lastSummaryUpdated: 1 },
        }
      );

      const existing = dbResp?.data || {};
      const existingSummary = existing?.jobSummary;
      const lastUpdated = existing?.lastSummaryUpdated;

      if (existingSummary && !isDataStale(lastUpdated)) {
        setJobSummary(existingSummary);
        writeCache(userData.userID, existingSummary); // ✅ cache DB result
        return;
      }

      // 2) AI call (only if DB missing/stale)
      if (!seed || !seed.title) {
        setNeedsSetup(true);
        return;
      }

      const payload = {
        title: seed.title,
        institution: seed.institution || "",
      };
      const aiResp = await privateApi.post(
        "/api/v1/ai/recommendation",
        payload
      );

      const content = aiResp?.data;
      const parsed: JobSummary = safeParseJson(
        typeof content === "string" ? content : JSON.stringify(content)
      );

      const clean: JobSummary = {
        job_title: parsed?.job_title || seed.title,
        average_salary: parsed?.average_salary || "—",
        job_openings: parsed?.job_openings || "—",
        market_trend: parsed?.market_trend || "—",
        professional_tips: Array.isArray(parsed?.professional_tips)
          ? parsed.professional_tips
          : [],
        career_outlook: parsed?.career_outlook,
      };

      setJobSummary(clean);
      writeCache(userData.userID, clean); // ✅ cache AI result
      await saveToDatabase(clean);
    } catch (error) {
      console.error("Error fetching job summary:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ---------- UI (unchanged from your compact card) ---------- */
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating your professional profile…
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-semibold">More info needed</p>
        </div>
        <p className="text-sm text-gray-700">
          To generate your professional profile, please complete your{" "}
          <span className="font-medium">Course Plan</span> and/or add{" "}
          <span className="font-medium">Work Experience</span> in your
          dashboard.
        </p>
      </div>
    );
  }

  if (!jobSummary) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-700">
          No professional profile available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm max-h-[658px]">
      <div className="relative px-6 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
        <p className="relative z-10 text-xl font-semibold tracking-tight text-gray-900">
          {jobSummary.job_title} — Professional Profile
        </p>
        <div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center  justify-between  border-gray-100 bg-white py-4">
              <div>
                <p className="text-sm text-gray-600">Average Salary</p>
                <p className="text-3xl font-medium text-gray-900">
                  {jobSummary.average_salary || "—"}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <p className="text-xs font-medium text-gray-900">
              {jobSummary.job_openings || "—"}
            </p>
            {/* <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div>
                <p className="text-sm text-gray-600">Market Trends</p>
                <p className="text-xs font-medium text-gray-900">
                  {jobSummary.market_trend || "—"}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div> */}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Licenses
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1">
              <Layers className="h-4 w-4 text-indigo-600" />
              Prerequisites
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              Requirements
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              {(jobSummary.professional_tips || []).length} tips
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1">
              <Wand2 className="h-4 w-4 text-indigo-600" />
              AI-personalized
            </span>
          </div>

          <div className="mt-6 flex items-center justify-end">
            <Button variant="outline" onClick={() => setDetailsOpen(true)}>
              View details
            </Button>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/80 to-transparent" />
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {jobSummary.job_title} — Full Profile
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Salary</p>
                    <p className="text-sm font-medium text-gray-900">
                      {jobSummary.average_salary || "—"}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
                  <div>
                    <p className="text-sm text-gray-600">Job Openings</p>
                    <p className="text-sm font-medium text-gray-900">
                      {jobSummary.job_openings || "—"}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
                  <div>
                    <p className="text-sm text-gray-600">Market Trends</p>
                    <p className="text-sm font-medium text-gray-900">
                      {jobSummary.market_trend || "—"}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4">
                  <div>
                    <p className="text-sm text-gray-600">Tips Available</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(jobSummary.professional_tips || []).length} tips
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {jobSummary.career_outlook && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Career Outlook
                  </p>
                  <p className="text-sm text-gray-700">
                    {jobSummary.career_outlook}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  <p className="text-sm font-semibold text-gray-900">
                    Professional Tips
                  </p>
                </div>
                {(jobSummary.professional_tips || []).length ? (
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {jobSummary.professional_tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No tips available.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default ProfessionProfile;
