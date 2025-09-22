/* KinsCare Conversation Logic (FSM) — with AI + College APIs wired */

import axios from "axios";

export type Sender = "bot" | "user";
export type QuickReply = { id: string; label: string; href?: string };
export type ChatMsg = {
  id: string;
  from: Sender;
  text: string;
  time?: string;
  quickReplies?: QuickReply[];
};

export type SessionData = {
  work_preference?:
    | "direct_patient_care"
    | "non_patient_facing"
    | "administrative";
  set_help_people?: "rehab_or_communication" | "analyze_data";
  years_of_experience?: number;
  preferred_state?: string;
  educational_background?: string;
  strengths?: string;
  environment_type?: "fast_or_high_stress" | "low_stress_preference";
  career_path?: string;
  program?: string;
  recommendation?: string;
  user_signed_in?: boolean;
};

export type FlowState = {
  step: StepId;
  session: SessionData;
  _awaiting?:
    | "years_of_experience"
    | "preferred_state"
    | "educational_background"
    | "strengths";
  _selectedProgram?: NursingProgram;
};

export type UIFrame = {
  messages: ChatMsg[];
  allowFreeText: boolean;
};

type StepId =
  | "welcome"
  | "hire_menu"
  | "hire_jumpstart"
  | "hire_post"
  | "hire_browse"
  | "caregiver_greeting"
  | "become_known_ask_track"
  | "become_known_allied_q1"
  | "become_known_allied_q2"
  | "become_known_allied_reco"
  | "become_known_nursing_menu"
  | "nursing_prereq_note"
  | "nursing_license_ask"
  | "nursing_years_ask"
  | "nursing_zip_ask"
  | "nursing_reco"
  | "become_unknown_edu"
  | "become_unknown_pref"
  | "become_unknown_strengths"
  | "become_unknown_env"
  | "unknown_reco"
  | "end";

type NursingProgram = "LPN" | "RN" | "BSN" | "MSN" | "ARNP" | "DNP";

/** API contracts */
type CareerRecoAPIIn = {
  educational_background?: string;
  work_preference?: string;
  strengths?: string;
  environment_type?: string;
};
type CareerRecoAPIOut = {
  career_path: string;
  program: string;
  recommendation: string;
  /** Optional additional fields are supported; we render safely */
  summary?: string;
  top_roles?: string[];
};

type CollegeRecoAPIOut = {
  /** Shape from your service; we pass it through */
  [k: string]: unknown;
};

/** ---- College Recommendation Caching Utilities ---- */
const COLLEGE_RECO_KEY = "ai_recommendation";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCachedCollegeReco():
  | { recommendationPhrase?: string; saved_at?: string; [k: string]: unknown }
  | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(COLLEGE_RECO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // minimal shape validation
    if (parsed && typeof parsed === "object") return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeCachedCollegeReco(obj: Record<string, unknown>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(COLLEGE_RECO_KEY, JSON.stringify(obj));
  } catch {
    // Swallow storage errors; do not break UX.
  }
}

/**
 * Fetches college recommendations for a given program phrase and caches the result.
 * This is safe to fire-and-forget; it won't throw unhandled rejections.
 */
async function fetchAndCacheCollegeRecos(programOrReco: string): Promise<void> {
  if (!programOrReco || !programOrReco.trim()) return;

  // Optional: if cache already exists for same phrase, skip fetch
  const existing = readCachedCollegeReco();
  if (existing?.recommendationPhrase === programOrReco) {
    return;
  }

  try {
    const { data: collegeRecommendation } = await axios.post<CollegeRecoAPIOut>(
      "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/ai/college-recommendation/",
      { program: programOrReco }
    );

    const aiRecommendation = {
      recommendationPhrase: programOrReco,
      ...collegeRecommendation,
      saved_at: new Date().toISOString(),
    };
    writeCachedCollegeReco(aiRecommendation);
  } catch (err) {
    // Log and continue silently; UX should not be blocked.
    // eslint-disable-next-line no-console
    console.error("Background college recommendation fetch failed:", err);
  }
}

// ——— Public API ———
export function createFlow(opts?: { userSignedIn?: boolean }): {
  state: FlowState;
  ui: UIFrame;
} {
  const state: FlowState = {
    step: "welcome",
    session: { user_signed_in: !!opts?.userSignedIn },
  };
  return { state, ui: render(state) };
}

export function restart(_: FlowState | undefined): {
  state: FlowState;
  ui: UIFrame;
} {
  const s: FlowState = { step: "welcome", session: {} };
  return { state: s, ui: render(s) };
}

export function exitFlow(state: FlowState): { state: FlowState; ui: UIFrame } {
  state.step = "end";
  return {
    state,
    ui: {
      messages: [
        bot(
          "Thanks for chatting with KinsCare today. If you need anything else, I’m here."
        ),
      ],
      allowFreeText: false,
    },
  };
}

export async function handleQuickReply(
  state: FlowState,
  payload: { id?: string; label?: string }
): Promise<{ state: FlowState; ui: UIFrame }> {
  const key = (payload.id || payload.label || "").trim();

  if (key === "exit") return exitFlow(state);
  if (key === "restart") return restart(state);

  if (key === "trigger_signup") {
    state.session.user_signed_in = true;

    // Reuse cached recos if we have them; otherwise attempt one fetch (non-blocking).
    const programOrReco = state.session.recommendation || state.session.program || "";
    const cached = readCachedCollegeReco();

    if (!cached && programOrReco) {
      // Attempt to fetch and cache; do not block UI
      void fetchAndCacheCollegeRecos(programOrReco);
    }

    // If we already have cache, confirm and offer to open; else confirm sign-in
    if (cached || programOrReco) {
      return {
        state,
        ui: {
          messages: [
            bot("Great! We’ve saved your college matches."),
            botWithButtons("Would you like to view them now?", [
              { id: "open_college_reco", label: "View College Matches" },
              {
                id: "open_college_reco_href",
                label: "Open Matches ↗",
                href: "/explore/college-matches",
              },
              restartBtn(),
              exitBtn(),
            ]),
          ],
          allowFreeText: false,
        },
      };
    }

    return {
      state,
      ui: {
        messages: [
          bot("Great! We’ll use your info to personalize matches."),
          botWithButtons("", [restartBtn(), exitBtn()]),
        ],
        allowFreeText: false,
      },
    };
  }

  // Optional: let the host app open a dialog for college recos
  if (key === "open_college_reco") {
    return {
      state,
      ui: {
        messages: [
          bot("Opening your college matches…"),
          botWithButtons("", [restartBtn(), exitBtn()]),
        ],
        allowFreeText: false,
      },
    };
  }

  switch (state.step) {
    case "welcome": {
      if (key === "hire") return goto(state, "hire_menu");
      if (key === "caregiver") return goto(state, "caregiver_greeting");
      if (key === "become") return goto(state, "become_known_ask_track");
      break;
    }

    case "hire_menu": {
      if (key === "hire_jumpstart") return goto(state, "hire_jumpstart");
      if (key === "hire_post") return goto(state, "hire_post");
      if (key === "hire_browse") return goto(state, "hire_browse");
      break;
    }

    case "become_known_ask_track": {
      if (key === "know_yes") {
        return {
          state: ((state.step = "become_known_nursing_menu"), state) && state,
          ui: render(state, {
            overrideMessage: `Are you interested in Nursing or Allied Healthcare?`,
            quick: [
              { id: "track_allied", label: "Allied Healthcare" },
              { id: "track_nursing", label: "Nursing" },
            ],
          }),
        };
      }
      if (key === "know_no") return goto(state, "become_unknown_edu");
      if (key === "track_allied") return goto(state, "become_known_allied_q1");
      if (key === "track_nursing")
        return goto(state, "become_known_nursing_menu");
      break;
    }

    case "become_known_allied_q1": {
      if (key === "allied_direct") {
        state.session.work_preference = "direct_patient_care";
        return goto(state, "become_known_allied_q2");
      }
      if (key === "allied_nonpatient") {
        state.session.work_preference = "non_patient_facing";
        return goto(state, "become_known_allied_q2");
      }
      break;
    }

    case "become_known_allied_q2": {
      if (key === "allied_help_yes") {
        state.session.set_help_people = "rehab_or_communication";
        return alliedRecommend(state); // KNOWN → no external API per requirement
      }
      if (key === "allied_help_no") {
        state.session.set_help_people = "analyze_data";
        return alliedRecommend(state); // KNOWN → no external API
      }
      break;
    }

    case "become_known_nursing_menu": {
      if (isNursing(key)) {
        state._selectedProgram = key as NursingProgram;
        return goto(state, "nursing_prereq_note");
      }
      break;
    }

    case "nursing_prereq_note": {
      if (key === "nursing_continue") return goto(state, "nursing_license_ask");
      break;
    }

    case "nursing_license_ask": {
      if (key === "has_cna") {
        state.session.career_path = "known";
        state._awaiting = "years_of_experience";
        return goto(state, "nursing_years_ask");
      }
      if (key === "no_license") {
        state.session.career_path = "known";
        return goto(state, "nursing_zip_ask");
      }
      break;
    }

    case "become_unknown_pref": {
      if (key === "pref_direct") {
        state.session.work_preference = "direct_patient_care";
        return goto(state, "become_unknown_strengths");
      }
      if (key === "pref_nonpatient") {
        state.session.work_preference = "non_patient_facing";
        return goto(state, "become_unknown_strengths");
      }
      if (key === "pref_admin") {
        state.session.work_preference = "administrative";
        return goto(state, "become_unknown_strengths");
      }
      break;
    }

    case "become_unknown_env": {
      if (key === "env_fast") {
        state.session.environment_type = "fast_or_high_stress";
        return unknownRecommend(state); // UNKNOWN → fire external API
      }
      if (key === "env_low") {
        state.session.environment_type = "low_stress_preference";
        return unknownRecommend(state); // UNKNOWN → fire external API
      }
      break;
    }
  }

  return { state, ui: render(state) };
}

export async function handleText(
  state: FlowState,
  text: string
): Promise<{ state: FlowState; ui: UIFrame }> {
  const clean = (text || "").trim();
  if (!clean) return { state, ui: render(state) };

  switch (state.step) {
    case "nursing_years_ask": {
      const n = Number(clean);
      if (!Number.isFinite(n) || n < 0) {
        return say(
          `Please enter a valid number of years (e.g., 0, 1, 2).`,
          true
        );
      }
      state.session.years_of_experience = n;
      state._awaiting = undefined;
      return goto(state, "nursing_zip_ask");
    }

    case "nursing_zip_ask": {
      state.session.preferred_state = clean;
      state.session.recommendation = state._selectedProgram || "";
      state.session.program = state._selectedProgram || "";
      return goto(state, "nursing_reco"); // KNOWN → no external API
    }

    case "become_unknown_edu": {
      state.session.educational_background = clean;
      return goto(state, "become_unknown_pref");
    }

    case "become_unknown_strengths": {
      state.session.strengths = clean;
      return goto(state, "become_unknown_env");
    }
  }

  return {
    state,
    ui: {
      messages: [user(clean)],
      allowFreeText: allowFreeTextFor(state.step),
    },
  };
}

// ——— Transitions + rendering ———
function goto(
  state: FlowState,
  next: StepId
): { state: FlowState; ui: UIFrame } {
  state.step = next;
  return { state, ui: render(state) };
}
function allowFreeTextFor(step: StepId): boolean {
  return [
    "nursing_years_ask",
    "nursing_zip_ask",
    "become_unknown_edu",
    "become_unknown_strengths",
  ].includes(step);
}

function render(
  state: FlowState,
  opts?: { overrideMessage?: string; quick?: QuickReply[] }
): UIFrame {
  const messages: ChatMsg[] = [];
  const push = (m: ChatMsg) => messages.push(m);

  switch (state.step) {
    case "welcome": {
      push(bot("Welcome to KinsCare! 👋 How can we help you today?"));
      push(
        botWithButtons("", [
          { id: "hire", label: "I want to hire a caregiver" },
          { id: "caregiver", label: "I’m a caregiver or CNA" },
          { id: "become", label: "I want to become a caregiver or nurse" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "hire_menu": {
      push(bot("We have three helpful options:"));
      push(
        bullets([
          "Let us find someone for you (KinsCare handpicks 2–3 candidates, interviews in ~3 days).",
          "Post a job announcement (caregivers apply to you).",
          "Search and contact caregivers yourself (browse profiles).",
        ])
      );
      push(
        botWithButtons("What would you like to do next?", [
          { id: "hire_jumpstart", label: "Let KinsCare Find Someone for Me" },
          { id: "hire_post", label: "Post a Job" },
          { id: "hire_browse", label: "Search Caregivers" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "hire_jumpstart": {
      push(
        bullets(["We do the work; 2–3 vetted matches in ~3 days.", "Save time"])
      );
      push(bot("Pricing: One-time $200, no hidden charges."));
      push(
        botWithButtons("", [
          {
            id: "open_jumpstart",
            label: "Get Matched by KinsCare ↗",
            href: "https://www.kinscare.org/jumpstart-hiring/apply",
          },
          restartBtn(),
          exitBtn(),
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "hire_post": {
      push(
        bullets([
          "Quick setup (~1 min).",
          "Seen by local caregivers.",
          "Applications go to your inbox.",
        ])
      );
      push(
        botWithButtons("", [
          {
            id: "open_post",
            label: "Find your next caregiver ↗",
            href: "https://www.kinscare.org/post-job",
          },
          restartBtn(),
          exitBtn(),
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "hire_browse": {
      push(
        bullets([
          "View profiles.",
          "Filter by skills/experience/location.",
          "Contact directly.",
        ])
      );
      push(
        botWithButtons("", [
          {
            id: "open_browse",
            label: "Browse Caregivers ↗",
            href: "https://www.kinscare.org/caregivers?shifts=Full+time&licenses=HCA",
          },
          restartBtn(),
          exitBtn(),
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "caregiver_greeting": {
      push(
        bot(
          "We help you find jobs, update your profile, and get career support."
        )
      );
      push(
        botWithButtons("", [
          {
            id: "open_jobs",
            label: "Find Jobs ↗",
            href: "https://www.kinscare.org/find-jobs",
          },
          restartBtn(),
          exitBtn(),
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "become_known_ask_track": {
      push(
        bot(
          "Do you know what career in nursing or allied healthcare you want to pursue?"
        )
      );
      push(
        botWithButtons("", [
          { id: "know_yes", label: "Yes" },
          { id: "know_no", label: "No" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "become_known_allied_q1": {
      push(bot("Do you prefer working directly with patients?"));
      push(
        botWithButtons("", [
          { id: "allied_direct", label: "Yes — direct patient care" },
          { id: "allied_nonpatient", label: "No — not patient-facing" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "become_known_allied_q2": {
      push(
        bot(
          "Do you prefer helping people recover physically or communicate better (Yes), or do you prefer analyzing medical data (No)?"
        )
      );
      push(
        botWithButtons("", [
          { id: "allied_help_yes", label: "Yes — rehab/communication" },
          { id: "allied_help_no", label: "No — analyze data" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "become_known_allied_reco": {
      const { career_path, program, recommendation } = state.session;
      push(
        summary("Recommended path (Allied Healthcare)", {
          career_path,
          program,
          recommendation,
        })
      );
      push(signupGate(state)); // terminal -> includes Restart + Exit
      return { messages, allowFreeText: false };
    }

    case "become_known_nursing_menu": {
      push(bot("Select your nursing career goal below:"));
      push(
        botWithButtons("", [
          { id: "LPN", label: "LPN" },
          { id: "RN", label: "RN" },
          { id: "BSN", label: "BSN" },
          { id: "MSN", label: "MSN" },
          { id: "ARNP", label: "ARNP" },
          { id: "DNP", label: "DNP" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "nursing_prereq_note": {
      push(bot(nursingPrereqText(state._selectedProgram!)));
      push(
        botWithButtons("Continue?", [
          { id: "nursing_continue", label: "Continue" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "nursing_license_ask": {
      push(bot("Do you currently hold an active license?"));
      push(
        botWithButtons("", [
          { id: "has_cna", label: "CNA" },
          { id: "no_license", label: "I have no license" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "nursing_years_ask": {
      push(
        bot(
          "How many years of experience as a CNA do you have? (enter a number)"
        )
      );
      return { messages, allowFreeText: true };
    }

    case "nursing_zip_ask": {
      push(bot("What is your ZIP code (or state)?"));
      return { messages, allowFreeText: true };
    }

    case "nursing_reco": {
      state.session.program = state._selectedProgram;
      state.session.recommendation = state._selectedProgram;
      state.session.career_path = "known";

      // Fire-and-forget background college recos as soon as program is known
      if (state.session.recommendation) {
        void fetchAndCacheCollegeRecos(state.session.recommendation);
      }

      push(
        summary(`Top ${state._selectedProgram} programs for you`, {
          career_path: state.session.career_path,
          program: state.session.program,
          recommendation: `We’ve handpicked the top ${state._selectedProgram} programs just for you.`,
        })
      );
      push(signupGate(state)); // terminal
      return { messages, allowFreeText: false };
    }

    case "become_unknown_edu": {
      push(
        bot(
          "Which best describes your highest education so far? (e.g., High school, Diploma, Bachelor’s, Master’s)"
        )
      );
      return { messages, allowFreeText: true };
    }

    case "become_unknown_pref": {
      push(
        bot(
          "Do you prefer direct patient care, behind-the-scenes work, or administrative tasks?"
        )
      );
      push(
        botWithButtons("", [
          { id: "pref_direct", label: "Direct patient care" },
          { id: "pref_nonpatient", label: "Behind the scenes" },
          { id: "pref_admin", label: "Administrative" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "become_unknown_strengths": {
      push(
        bot(
          "What are your strengths? (e.g., teamwork, communication, compassion, problem-solving, attention to detail, organization, technical skills, empathy)"
        )
      );
      return { messages, allowFreeText: true };
    }

    case "become_unknown_env": {
      push(
        bot("Are you comfortable with fast-paced or high-stress environments?")
      );
      push(
        botWithButtons("", [
          { id: "env_fast", label: "Yes — fast/high-stress" },
          { id: "env_low", label: "No — prefer low stress" },
        ])
      );
      return { messages, allowFreeText: false };
    }

    case "unknown_reco": {
      // This state is rendered only after unknownRecommend() sets the session & step.
      const { career_path, program, recommendation } = state.session;
      push(
        summary("Your personalized career summary", {
          career_path,
          program,
          recommendation,
        })
      );
      push(signupGate(state)); // terminal
      return { messages, allowFreeText: false };
    }

    case "end": {
      push(bot("Chat ended. Tap Restart to begin again."));
      push(botWithButtons("", [restartBtn()]));
      return { messages, allowFreeText: false };
    }
  }

  if (opts?.overrideMessage) {
    return {
      messages: [botWithButtons(opts.overrideMessage, opts.quick ?? [])],
      allowFreeText: false,
    };
  }
  return { messages, allowFreeText: allowFreeTextFor(state.step) };
}

// ——— Reco logic ———
async function alliedRecommend(state: FlowState): Promise<{ state: FlowState; ui: UIFrame }> {
  // KNOWN pathway → DO NOT call external API (per your requirement).
  const res = await recommend_trigger({
    context: "allied_healthcare_known",
    work_preference: state.session.work_preference!,
    set_help_people: state.session.set_help_people!,
  });
  state.session.career_path = res.career_path;
  state.session.program = res.program;
  state.session.recommendation = res.recommendation;

  // Background fetch as soon as a recommendation/program is determined
  if (state.session.recommendation) {
    void fetchAndCacheCollegeRecos(state.session.recommendation);
  }

  state.step = "become_known_allied_reco";
  return { state, ui: render(state) };
}

async function unknownRecommend(state: FlowState): Promise<{ state: FlowState; ui: UIFrame }> {
  // UNKNOWN pathway → Call external API with captured answers.
  const payload: CareerRecoAPIIn = {
    educational_background: state.session.educational_background,
    work_preference: state.session.work_preference,
    strengths: state.session.strengths,
    environment_type: state.session.environment_type,
  };

  try {
    const { data } = await axios.post<CareerRecoAPIOut>(
      "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/ai/recommend-career",
      payload
    );

    // Normalize and store into session
    state.session.career_path = data?.career_path || "Healthcare";
    state.session.program = data?.program || "CNA → LPN/RN Pathway";
    state.session.recommendation =
      data?.recommendation ||
      "Start with CNA to get clinical experience, then bridge upward.";

    // Fire background college recos using whichever phrase we have
    if (state.session.recommendation) {
      void fetchAndCacheCollegeRecos(state.session.recommendation);
    } else if (state.session.program) {
      void fetchAndCacheCollegeRecos(state.session.program);
    }

    // Move to summary state for unknown
    state.step = "unknown_reco";

    // Render a concise summary including any optional fields the API provided.
    const lines: Record<string, unknown> = {
      career_path: state.session.career_path,
      program: state.session.program,
      recommendation: state.session.recommendation,
    };
    if (data?.summary) lines["summary"] = data.summary;
    if (Array.isArray(data?.top_roles) && data.top_roles.length)
      lines["top_roles"] = data.top_roles.slice(0, 5).join(", ");

    return {
      state,
      ui: {
        messages: [
          summary("Your personalized career summary", lines),
          signupGate(state),
        ],
        allowFreeText: false,
      },
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Career recommendation API failed:", err);
    // Safe fallback to internal stub rather than breaking UX
    const res = await recommend_trigger({
      context: "career_exploration_unknown",
      educational_background: state.session.educational_background!,
      work_preference: state.session.work_preference!,
      strengths: state.session.strengths!,
      environment_type: state.session.environment_type!,
    });
    state.session.career_path = res.career_path;
    state.session.program = res.program;
    state.session.recommendation = res.recommendation;

    // Fire background college recos on fallback as well
    if (state.session.recommendation) {
      void fetchAndCacheCollegeRecos(state.session.recommendation);
    } else if (state.session.program) {
      void fetchAndCacheCollegeRecos(state.session.program);
    }

    state.step = "unknown_reco";
    return { state, ui: render(state) };
  }
}

/** Internal fallback stub (kept for known-path & error fallback) */
export async function recommend_trigger(
  input: Record<string, unknown>
): Promise<{ career_path: string; program: string; recommendation: string }> {
  if (input.context === "allied_healthcare_known") {
    if (input.work_preference === "direct_patient_care") {
      if (input.set_help_people === "rehab_or_communication") {
        return {
          career_path: "Allied Healthcare",
          program: "Physical Therapy Aide / SLPA",
          recommendation:
            "Hands-on rehab/communication roles fit your preferences. Explore PTA/SLPA certificates near you.",
        };
      }
      return {
        career_path: "Allied Healthcare",
        program: "Diagnostic Imaging Tech",
        recommendation:
          "Blend patient interaction with technical analysis in imaging programs.",
      };
    } else {
      return {
        career_path: "Allied Healthcare",
        program: "Health Info Mgmt / Med Lab Tech",
        recommendation:
          "Non-patient-facing options in data, quality, or lab analysis.",
      };
    }
  }
  const pref = input.work_preference;
  if (pref === "direct_patient_care") {
    return {
      career_path: "Patient Care",
      program: "CNA → LPN/RN Pathway",
      recommendation:
        "Start with CNA to gain clinical exposure, then bridge to LPN/RN.",
    };
  }
  if (pref === "administrative") {
    return {
      career_path: "Healthcare Administration",
      program: "Medical Office Admin / HSM",
      recommendation:
        "Use organization & communication strengths toward admin leadership.",
    };
  }
  return {
    career_path: "Healthcare Technology",
    program: "Health Informatics / Imaging Tech",
    recommendation:
      "Combine technical skills with healthcare impact in informatics or imaging.",
  };
}

// ——— Helpers (incl. say + signupGate) ———
function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function bot(text: string): ChatMsg {
  return { id: id("b"), from: "bot", text, time: "now" };
}
function user(text: string): ChatMsg {
  return { id: id("u"), from: "user", text, time: "now" };
}
function bullets(lines: string[]): ChatMsg {
  return bot("• " + lines.join("\n• "));
}
function botWithButtons(text: string, buttons: QuickReply[]): ChatMsg {
  return { id: id("b"), from: "bot", text, time: "now", quickReplies: buttons };
}
function summary(title: string, fields: Record<string, unknown>): ChatMsg {
  const rows = Object.entries(fields)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([k, v]) => `• ${capitalize(k)}: ${v as string}`);
  return bot(`${title}\n${rows.join("\n")}`);
}
function capitalize(x: string): string {
  return x.slice(0, 1).toUpperCase() + x.slice(1).replace(/_/g, " ");
}
function exitBtn(): QuickReply {
  return { id: "exit", label: "Exit chat" };
}
function restartBtn(): QuickReply {
  return { id: "restart", label: "Restart conversation" };
}
function isNursing(x: string): boolean {
  return ["LPN", "RN", "BSN", "MSN", "ARNP", "DNP"].includes(x);
}
function nursingPrereqText(p: NursingProgram): string {
  const base: Record<NursingProgram, string> = {
    LPN: "LPN: CNA often recommended as entry experience; varies by school/state.",
    RN: "RN: CNA or LPN experience may be recommended/required depending on track.",
    BSN: "BSN: Some direct-entry; CNA/LPN experience can help.",
    MSN: "MSN: Typically requires BSN and RN license.",
    ARNP: "ARNP: Typically RN plus graduate education (MSN/DNP).",
    DNP: "DNP: Typically RN plus BSN/MSN (terminal clinical degree).",
  };
  return base[p];
}
function say(
  text: string,
  allowFreeText = false
): { state?: FlowState; ui: UIFrame } {
  return { ui: { messages: [bot(text)], allowFreeText } } as {
    state?: FlowState;
    ui: UIFrame;
  };
}
function signupGate(state: FlowState): ChatMsg {
  if (state.session.user_signed_in) {
    return botWithButtons("You're signed in. Ready to proceed?", [
      restartBtn(),
      // exitBtn(),
    ]);
  }
  return botWithButtons(
    "Sign up to see your matches. We’ll prefill your details to save time.",
    [{ id: "trigger_signup", label: "Sign up" }]
  );
}
