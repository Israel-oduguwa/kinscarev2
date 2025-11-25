import axios, { AxiosError } from "axios";

export const twilioApi = axios.create({
  baseURL: "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/twilio/",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Normalize errors
twilioApi.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const msg =
      (err.response?.data as any)?.error ||
      (err.response?.data as any)?.message ||
      err.message ||
      "Network error";
    return Promise.reject(new Error(msg));
  }
);

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0;
  let lastErr: any;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      if (e?.message && /timeout|network|ECONNRESET|ECONNREFUSED/i.test(e.message) && attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
        attempt++;
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

// ---- Types (optional but nice) ----
export type Role = "provider" | "caregiver";

export interface SignupDripBody {
  providerPhone: string;
  country?: string;        // e.g., "NG" | "US"
  role?: Role;             // default "provider" on server
  actionUrl: string;
  jumpstartUrl: string;
}

export interface ReferralDripBody {
  providerPhone: string;
  country?: string;
  caregiverName: string;
  url: string;
}

export async function sendSignupDripSMS(body: SignupDripBody) {
  const { data } = await withRetry(() =>
    twilioApi.post("send-signedup-provider-sms", body)
  );
  return data as {
    ok: boolean;
    to: string;
    scheduled: Array<{ sid: string; status: string; sendAt: string }>;
  };
}

export async function sendReferralDripSMS(body: ReferralDripBody) {
  // NOTE: triple “r” in the route path
  const { data } = await withRetry(() =>
    twilioApi.post("send-referrred-provider-sms", body)
  );
  return data as {
    ok: boolean;
    to: string;
    scheduled: Array<{ sid: string; status: string; sendAt: string }>;
  };
}
