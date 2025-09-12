/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/role-supports-aria-props */
"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import MongoContext from "@/app/MongoContext";
import { Skeleton } from "@/components/ui/skeleton";
import ProgramRecommendation from "../Explore/ProgramRecommendation";

/** ----- Career Path Master List (~40+) ----- */
const CAREER_PATHS = [
  // Direct Patient Care
  "Certified Nursing Assistant (CNA)",
  "Licensed Practical Nurse (LPN)",
  "Registered Nurse (RN)",
  "Nurse Practitioner (NP)",
  "Medical Assistant (MA)",
  "Dental Assistant",
  "Physical Therapy Assistant (PTA)",
  "Occupational Therapy Assistant (OTA)",
  "Surgical Technologist",
  "Respiratory Therapist",
  // Allied Health / Clinical Support
  "Phlebotomy Technician",
  "Emergency Medical Technician (EMT)",
  "Paramedic",
  "Pharmacy Technician",
  "Radiologic Technologist",
  "Diagnostic Medical Sonographer (Ultrasound)",
  "Dialysis Technician",
  "Cardiovascular Technologist",
  "Clinical Laboratory Technician",
  "Sterile Processing Technician",
  // Admin / Non-Patient-Facing
  "Health Information Management (HIM)",
  "Health Informatics Specialist",
  "Medical Office Administrator",
  "Medical Billing & Coding",
  "Medical Records Technician",
  "Healthcare Data Analyst",
  "Patient Services Representative",
  "Practice/Clinic Manager",
  "Scheduling Coordinator",
  "Hospital Unit Clerk",
  // Specialized / Advanced / Public Health
  "Surgical Nurse",
  "Oncology Nurse",
  "Pediatric Nurse",
  "Travel Nurse",
  "Home Health Aide",
  "Hospice Care Worker",
  "Nurse Case Manager",
  "Nurse Educator",
  "Public Health Professional",
  "Clinical Research Coordinator",
  // Extra admin/IT-adjacent tracks
  "Healthcare Quality & Compliance Associate",
  "Revenue Cycle Specialist",
  "EHR/EMR Specialist",
  "Patient Intake Coordinator",
];

/** Types for recommendations payload */
type CollegeProgram = { program_name: string; url: string };
type Recommendations = {
  recommendationPhrase: string;
  success: boolean;
  collegePrograms?: CollegeProgram[];
  saved_at?: string;
};

function sentenceCase(s: string) {
  const t = (s || "").trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Infer tracks from the standard recommendation phrase */
function inferTracksFromPhrase(phrase?: string): string[] {
  if (!phrase) return [];
  const lower = phrase.toLowerCase();
  const startKey = "pursuing a ";
  const endKey = " certification";
  const sIdx = lower.indexOf(startKey);
  const eIdx = lower.indexOf(endKey, sIdx + startKey.length);
  if (sIdx === -1 || eIdx === -1) return [];

  const core = phrase
    .slice(sIdx + startKey.length, eIdx)
    .replace(/[^a-zA-Z0-9/ ,\-]/g, " ")
    .trim();

  let parts = core.split(/\s+or\s+|,\s*/i).map((p) => p.trim());
  parts = parts.map((p) => {
    if (/^him$/i.test(p)) return "Health Information Management (HIM)";
    if (/^hi$/i.test(p)) return "Health Informatics Specialist";
    if (/^health information management$/i.test(p))
      return "Health Information Management (HIM)";
    if (/^health informatics$/i.test(p)) return "Health Informatics Specialist";
    return p
      .replace(/\b\w/g, (m) => m.toUpperCase())
      .replace(/\s+/g, " ")
      .trim();
  });

  const mapToCanonical = (val: string) => {
    const candidates = [
      "Health Information Management (HIM)",
      "Health Informatics Specialist",
      "Medical Assistant (MA)",
      "Certified Nursing Assistant (CNA)",
    ];
    const found = CAREER_PATHS.find(
      (c) => c.toLowerCase() === val.toLowerCase()
    );
    if (found) return found;
    for (const c of CAREER_PATHS) {
      if (c.toLowerCase().includes(val.toLowerCase())) return c;
    }
    for (const c of candidates) {
      if (c.toLowerCase().includes("informat") && /informat/i.test(val))
        return c;
      if (c.toLowerCase().includes("management") && /manag/i.test(val))
        return c;
      if (/medical assistant/i.test(val)) return "Medical Assistant (MA)";
      if (/nursing assistant|cna/i.test(val))
        return "Certified Nursing Assistant (CNA)";
    }
    return val;
  };

  const normalized = Array.from(new Set(parts.map(mapToCanonical)));
  return normalized.filter(Boolean);
}

export default function CareerMapPage() {
  const { user, userData }: any = useContext(MongoContext);

  /* Source */
  const rec: Recommendations | null = useMemo(() => {
    const r = user?.customData?.recommendations;
    if (!r || typeof r !== "object") return null;
    return r as Recommendations;
  }, [user]);

  const isAssistantHandoff = !!rec?.success;
  const existingCareerPath: string | undefined =
    user?.customData?.careerPath || undefined;

  /* Derive goal */
  const inferred = useMemo(
    () => inferTracksFromPhrase(rec?.recommendationPhrase),
    [rec?.recommendationPhrase]
  );
  const initialGoal =
    existingCareerPath || inferred[0] || "Certified Nursing Assistant (CNA)";

  /* UI state */
  const [selectedGoal, setSelectedGoal] = useState<string>(initialGoal);
  const [stepConfirmed, setStepConfirmed] = useState<boolean>(false);
  const [showGoalPicker, setShowGoalPicker] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  /* If assistant + have a goal, treat as already confirmed (we’re skipping Step 1) */
  useEffect(() => {
    if (isAssistantHandoff && initialGoal) {
      setSelectedGoal(initialGoal);
      setStepConfirmed(true);
    }
  }, [isAssistantHandoff, initialGoal]);

  /* If DB already has a goal, reflect as saved */
  useEffect(() => {
    if (existingCareerPath) {
      setSelectedGoal(existingCareerPath);
      setStepConfirmed(true);
    }
  }, [existingCareerPath]);

  const handleConfirm = useCallback(async () => {
    setStepConfirmed(true);
    // TODO: persist to DB
    // await saveCareerGoal({ careerPath: selectedGoal, source: isAssistantHandoff ? "assistant" : "wizard" });
  }, [selectedGoal, isAssistantHandoff]);

  /* Filtered list for modal search */
  const filteredGoals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CAREER_PATHS;
    return CAREER_PATHS.filter((g) => g.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h2 className="text-lg mb-4 font-medium flex items-center gap-2">
        <svg
          className="h-5 w-5 text-indigo-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M22 10v6M2 10v6M7 10v6M17 10v6M12 3l8 4-8 4-8-4 8-4zM12 11v10" />
        </svg>
        Your Program Matches
      </h2>
      {/* ====== ASSISTANT USERS: SKIP STEP 1, SHOW GOAL SUMMARY + PROGRAMS ====== */}
      {isAssistantHandoff ? (
        <>
          {/* Compact Goal Summary with Change Path */}
          <section className="mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    1
                  </div>
                  <h2 className="text-lg font-medium">
                    Your Selected Career Path
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Saved
                </span>
              </div>

              {rec?.recommendationPhrase && (
                <p className="mb-4 text-sm text-gray-700">
                  {sentenceCase(rec.recommendationPhrase)}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Current goal</p>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {selectedGoal}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoalPicker(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 self-start"
                >
                  Change path
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 01.94 1.17l-4.24 3.36a.75.75 0 01-.94 0L5.27 8.4a.75.75 0 01-.04-1.19z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Step 2 immediately (Programs) */}
          <section id="programs">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  2
                </div>
                <h2 className="text-lg font-medium">
                  Programs That Match Your Path
                </h2>
              </div>
              <ProgramRecommendation />
            </div>
          </section>
        </>
      ) : (
        /* ====== NEW USERS: SHOW STEP 1, LOCK STEP 2 UNTIL CONFIRMED ====== */
        <>
          {/* STEP 1 — Confirm Career Goal (full card UI) */}
          <section className="mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    1
                  </div>
                  <h2 className="text-lg font-medium">
                    Confirm Your Career Goal
                  </h2>
                </div>
                {stepConfirmed && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Saved
                  </span>
                )}
              </div>

              {rec?.recommendationPhrase && (
                <p className="mb-4 text-sm text-gray-700">
                  {sentenceCase(rec.recommendationPhrase)}
                </p>
              )}

              <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Selected goal</p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {selectedGoal}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowGoalPicker(true)}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Choose a different path
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 01.94 1.17l-4.24 3.36a.75.75 0 01-.94 0L5.27 8.4a.75.75 0 01-.04-1.19z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {!stepConfirmed ? (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 sm:w-auto"
                  >
                    Confirm Career Goal
                  </button>
                ) : (
                  <a
                    href="#programs"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 sm:w-auto"
                  >
                    Next: Explore Programs
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* STEP 2 — Programs (locked until confirm) */}
          <section
            id="programs"
            aria-disabled={!stepConfirmed}
            className={!stepConfirmed ? "opacity-60" : ""}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  2
                </div>
                <h2 className="text-lg font-medium">
                  Programs That Match Your Path
                </h2>
              </div>

              {!stepConfirmed ? (
                <p className="text-sm  text-gray-600">
                  see recommendation after you confirm your goal.
                </p>
              ) : (
                <ProgramRecommendation />
              )}
            </div>
          </section>
        </>
      )}

      {/* ---- Searchable Goal Picker Modal (used in both modes) ---- */}
      {showGoalPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowGoalPicker(false)}
          />
          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="text-base font-semibold">
                  Choose a Career Path
                </h3>
                <button
                  onClick={() => setShowGoalPicker(false)}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="px-5 pb-2 pt-4">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search (e.g., CNA, Health Informatics, Billing)…"
                  className="mb-4 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring"
                />

                <div className="max-h-80 overflow-y-auto pr-1">
                  <ul className="grid grid-cols-1 gap-2">
                    {CAREER_PATHS.filter((g) =>
                      g.toLowerCase().includes(search.trim().toLowerCase())
                    ).map((g) => (
                      <li key={g}>
                        <button
                          onClick={() => {
                            setSelectedGoal(g);
                            // If they change path while in assistant mode, we can keep step as confirmed.
                            setShowGoalPicker(false);
                          }}
                          className={[
                            "w-full rounded-xl border px-3 py-2 text-left text-sm",
                            selectedGoal === g
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          {g}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end gap-2 pb-4">
                  <button
                    onClick={() => setShowGoalPicker(false)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowGoalPicker(false)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Keep Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
