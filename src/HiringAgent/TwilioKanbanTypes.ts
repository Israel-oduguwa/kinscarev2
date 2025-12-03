// TwilioKanbanTypes.ts

export type ColumnKey =
  | "jobs"
  | "confirmed"
  | "post_job"
  | "add_payment"
  | "match_made";

export const COLUMN_ORDER: ColumnKey[] = [
  "jobs",
  "confirmed",
  "post_job",
  "add_payment",
  "match_made",
];

export const COLUMN_CONFIG: Record<
  ColumnKey,
  { title: string; subtitle: string }
> = {
  jobs: {
    title: "Jobs",
    subtitle: "Provider replied YES via SMS",
  },
  confirmed: {
    title: "Confirmed",
    subtitle: "Contacted & confirmed details",
  },
  post_job: {
    title: "Posted job",
    subtitle: "Job selected or created",
  },
  add_payment: {
    title: "Add payment",
    subtitle: "Payment / verification pending",
  },
  match_made: {
    title: "Match made",
    subtitle: "Caregiver(s) matched",
  },
};

// Raw document shape from your /twilio-signup collection
export type TwilioApplicantRaw = {
  _id: any;
  email?: string | null;
  phone?: string | null;
  zipcode?: string | null;

  source?: string;
  channel?: string;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;

  tags?: string[];

  existingAccount?: boolean;
  temp_hash?: string | null;
  userID?: string | null;

  auth?: {
    email?: string | null;
    tel?: string | null;
    role?: string | null;
    mode?: string | null;
    acquisition_channel?: string | null;
    [key: string]: any;
  };
  mode?: string | null;

  jump_start?: any;

  // Canonical jumpstart object
  jumpstart?: {
    enabled?: boolean;
    paymentVerified?: boolean;
    paymentApplied?: boolean;
    paymentAppliedAt?: string;
    paymentAppliedBy?: string;
    match?: {
      status?: string; // "matched", "provider_approved", "unmatched", etc.
      providerApprovedAt?: string;
      providerApprovedBy?: string;
      caregiverUserID?: string | null;
      caregiverContactId?: string | null;
      jobId?: any;
      notes?: string | null;
      matchedAt?: string;
      matchedBy?: string;
      unmatchedAt?: string | null;
      unmatchedBy?: string | null;
    };
    [key: string]: any;
  };

  contact?: any;
  executionSid?: string | null;
  flowSid?: string | null;

  contacted?: boolean;
  workflowStage?: ColumnKey | string;
  jobCount?: number | null;
  lastJobCreated?: string | null;

  // Job info
  jobCreatedByAgentId?: string | null;
  jobId?: any;
  jobOwnerUserID?: string | null;
  jobSource?: string | null;
  jobStatus?: string | null; // "pending_provider_approval", "approved", etc.

  agent_jobs?: {
    jobId: any;
    title?: string;
    created?: string;
    draft?: boolean;
    schedule?: string[];
    licenses?: string[];
    days?: string[];
    zipcode?: string;
    state?: string;
    ownerUserID?: string;
    [key: string]: any;
  }[];

  matchedCaregiverUserID?: string | null;
  matchedJobId?: any;
};

// Flags we use in UI for workflow
export type ApplicantStageFlags = {
  stage: ColumnKey;
  contacted: boolean;
  postJob: boolean;
  addPayment: boolean;
  matchMade: boolean;
  verified: boolean;
  hasFreshJob: boolean;
  paymentNeeded: boolean;
  isRegistered: boolean;
};

// Final applicant we use in the UI
export type Applicant = TwilioApplicantRaw &
  ApplicantStageFlags & {
    _id: string; // force string for React keys + DnD ids
  };

// Board state (columns → applicants)
export type BoardState = Record<ColumnKey, Applicant[]>;

export type Meta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  sort: string;
  filters?: Record<string, any>;
};

export type FiltersState = {
  search: string;
  hasAccount: "all" | "true" | "false";
  source: "twilio" | "providers";
  jobWindow: "any" | "3d" | "2w" | "4w";
  postedJob: "all" | "true" | "false";
};
