"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApiClient } from "@/hooks/useApiClient";

/** LocalStorage keys */
const LS_PERSON_ID = "customerio_id";
const LS_FIRST = "customerio_fname";
const LS_LAST = "customerio_lname";

/** Dedupes the update call so you don’t hit your endpoint on refresh */
const makeDedupeKey = (userID: string, personId?: string | null) =>
  `kc_cio_updated_${userID}_${personId ?? "unknown"}`;

/** Small helpers */
const safeSetLS = (k: string, v: string) => {
  try {
    if (typeof window !== "undefined") localStorage.setItem(k, v);
  } catch {}
};
const safeGetLS = (k: string): string | null => {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const setCookie = (name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 30) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
};
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2] ? decodeURIComponent(match[2]) : null;
};

/**
 * Reads personId (`cid`) from the URL, persists to LS + cookie,
 * and returns the chosen id. Also stores optional first/last (fn/ln).
 *
 * URL example:
 *   /some-path?cid=abc123&fn=Jane&ln=Doe
 */
export function useCioId(): string | null {
  const [cioId, setCioId] = useState<string | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    try {
      const fromQuery = params.get("cid");
      const getfname = params.get("fn");
      const getLname = params.get("ln");

      const fromLs = safeGetLS(LS_PERSON_ID);
      const fromCookie = getCookie(LS_PERSON_ID);

      const chosen = fromQuery || fromLs || fromCookie || null;

      if (fromQuery) {
        safeSetLS(LS_PERSON_ID, fromQuery);
        safeSetLS(LS_FIRST, getfname ?? "");
        safeSetLS(LS_LAST, getLname ?? "");
        setCookie(LS_PERSON_ID, fromQuery);
      }

      setCioId(chosen);
    } catch {
      setCioId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return cioId;
}

/**
 * Pulls common prefill and UTM params for your forms.
 *
 * Supported:
 *   email, fn|first_name, ln|last_name, city, phone
 *   utm_source, utm_medium, utm_campaign, utm_content, utm_term
 */
export function usePrefill() {
  const params = useSearchParams();

  return useMemo(() => {
    const get = (k: string) => {
      const v = params.get(k);
      return v ? decodeURIComponent(v) : "";
    };

    return {
      email: get("email"),
      firstName: get("fn") || get("first_name"),
      lastName: get("ln") || get("last_name"),
      city: get("city"),
      phone: get("phone"),
      utm: {
        source: params.get("utm_source") || undefined,
        medium: params.get("utm_medium") || undefined,
        campaign: params.get("utm_campaign") || undefined,
        content: params.get("utm_content") || undefined,
        term: params.get("utm_term") || undefined,
      },
    };
  }, [params]);
}

/**
 * Call your API to sync the Customer.io person to your internal user.
 * - Endpoint: /api/v1/auth/update_customerio_user
 * - Payload: { personId, userID }
 * - Safe to call multiple times; this function dedupes repeat calls per userID+personId.
 */
export async function updateCustomerioUser(
  personId: string | null | undefined,
  userID: string | null | undefined
): Promise<{ ok: boolean }> {
  if (!personId || !userID) return { ok: false };

  // client-side dedupe so page reloads don’t re-fire the same update
  const dedupeKey = makeDedupeKey(userID, personId);
  try {
    if (typeof window !== "undefined" && localStorage.getItem(dedupeKey)) {
      return { ok: true };
    }

    await privateApi.post("/api/v1/auth/update_customerio_user", {
      personId,
      userID,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(dedupeKey, new Date().toISOString());
    }

    return { ok: true };
  } catch (e) {
    // Non-blocking by design; log and continue your flow
    // eslint-disable-next-line no-console
    console.warn("updateCustomerioUser failed:", e);
    return { ok: false };
  }
}
