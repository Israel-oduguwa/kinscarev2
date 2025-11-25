"use client";

import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_KINSCARE_API_URL; // e.g. "https://api.kinscare.org"

// Public client: no auth header
const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

// Hook that returns a private client wired to Clerk token
export function useApiClient(): {
  publicApi: AxiosInstance;
  privateApi: AxiosInstance;
} {
  const { getToken } = useAuth();

  const privateApi = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
    });

    // Add token automatically for every request of this instance
    instance.interceptors.request.use(async (config) => {
      const token = await getToken();

      if (token) {
        // Ensure headers exists and is typed correctly
        if (!config.headers) {
          config.headers = {} as AxiosRequestHeaders;
        }

        (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return instance;
  }, [getToken]);

  return { publicApi, privateApi };
}
