"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/hooks/useApiClient";

const API_BASE = ""https://jrp7pe2xhj.us-east-1.awsapprunner.com";

export type InitializeStatus = "idle" | "loading" | "success" | "error";

export type GetUserDataResponse<TUser = any, TContact = any> = {
  ok: boolean;
  users?: TUser | null;
  contacts?: TContact | null;
  ts?: string | number | null;
  message?: string;
  error?: string;
};

export type RefreshResult = {
  ok: boolean;
  ts: string | number | null;
  reason?: "not-signed-in" | "aborted" | "timeout";
  error?: string;
};

export type UseInitializeOptions = {
  initialFetch?: boolean;
  keepStaleDuringRefresh?: boolean;
  requestTimeoutMs?: number; // default 15000
};

export const useInitialize = <TUser = any, TContact = any>(
  options: UseInitializeOptions = {}
) => {
  const {
    initialFetch = true,
    keepStaleDuringRefresh = true,
    requestTimeoutMs = 15000,
  } = options;

  const { getToken, isSignedIn } = useAuth();
  const { privateApi } = useApiClient();

  const [userData, setUserData] = useState<TUser | null>(null);
  const [contactData, setContactData] = useState<TContact | null>(null);

  const [status, setStatus] = useState<InitializeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | number | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Used to prevent stale response overwrites
  const requestSeqRef = useRef(0);

  // Used to cancel in-flight request
  const abortRef = useRef<AbortController | null>(null);

  // Track whether we currently have data without adding state deps
  const hasDataRef = useRef(false);
  useEffect(() => {
    hasDataRef.current = !!userData || !!contactData;
  }, [userData, contactData]);

  const refreshData = useCallback(async (): Promise<RefreshResult> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const seq = ++requestSeqRef.current;

    if (!isSignedIn) {
      if (mountedRef.current) {
        setUserData(null);
        setContactData(null);
        setStatus("idle");
        setError(null);
        setLastUpdated(null);
      }
      return { ok: false, ts: null, reason: "not-signed-in" };
    }

    if (mountedRef.current) {
      setError(null);

      // If we already have data and want stale during refresh, don't flip to loading
      if (hasDataRef.current && keepStaleDuringRefresh) {
        // keep status as-is (usually success)
      } else {
        setStatus("loading");
      }
    }

    try {
      const token = await getToken();
      if (!token) throw new Error("No Clerk token available");

      const res = await privateApi.get<GetUserDataResponse<TUser, TContact>>(
        `${API_BASE}/api/v1/auth/get_user_data`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          timeout: requestTimeoutMs,
        }
      );

      const payload = res?.data;

      // Ignore out-of-order responses
      if (seq !== requestSeqRef.current) {
        return { ok: false, ts: null, reason: "aborted" };
      }

      if (payload?.ok) {
        if (mountedRef.current) {
          setUserData(payload.users ?? null);
          setContactData(payload.contacts ?? null);
          setStatus("success");
          setLastUpdated(payload.ts ?? null);
          setError(null);
        }
        return { ok: true, ts: payload.ts ?? null };
      }

      const msg =
        payload?.message ||
        payload?.error ||
        "Failed to load user data";

      if (mountedRef.current) {
        setStatus("error");
        setError(msg);
      }

      return { ok: false, ts: payload?.ts ?? null, error: msg };
    } catch (err: any) {
      const isAbort =
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED";

      if (isAbort) {
        return { ok: false, ts: null, reason: "aborted" };
      }

      const isTimeout =
        err?.code === "ECONNABORTED" ||
        String(err?.message || "").toLowerCase().includes("timeout");

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (isTimeout
          ? "Request timed out. Please check your connection and try again."
          : "Network/server error. Please try again.");

      if (mountedRef.current) {
        setStatus("error");
        setError(msg);
      }

      return {
        ok: false,
        ts: null,
        reason: isTimeout ? "timeout" : undefined,
        error: msg,
      };
    }
  }, [
    privateApi,
    getToken,
    isSignedIn,
    keepStaleDuringRefresh,
    requestTimeoutMs,
  ]);

  // ✅ Initial fetch ONLY once per sign-in, no infinite loop
  const didFetchForSignInRef = useRef(false);
  useEffect(() => {
    if (!initialFetch) return;

    if (!isSignedIn) {
      didFetchForSignInRef.current = false; // reset when user signs out
      return;
    }

    if (didFetchForSignInRef.current) return;
    didFetchForSignInRef.current = true;

    refreshData();
  }, [initialFetch, isSignedIn, refreshData]);

  const isLoading = status === "loading" && !userData && !contactData;
  const isRefreshing =
    status === "loading" && (userData !== null || contactData !== null);

  return {
    userData,
    contactData,
    setUserData,
    setContactData,
    refreshData,

    status,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,

    isReady: status === "success",
    hasError: status === "error",
  };
};
