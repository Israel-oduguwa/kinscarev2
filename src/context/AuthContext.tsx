"use client";

import React, { createContext, useContext } from "react";
import type {
  InitializeStatus,
  RefreshResult,
} from "@/hooks/useInitialize";

export type UserData = any | null;
export type ContactData = any | null;

export type AuthContextValue = {
  userData: UserData;
  contactData: ContactData;

  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setContactData: React.Dispatch<React.SetStateAction<ContactData>>;

  refreshData: () => Promise<RefreshResult>;

  status: InitializeStatus;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: string | number | null;

  isReady: boolean;
  hasError: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
};

export default AuthContext;
