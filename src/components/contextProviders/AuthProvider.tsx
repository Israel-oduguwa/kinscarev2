"use client";

import React, { useMemo } from "react";
import AuthContext, { AuthContextValue } from "@/context/AuthContext";
import { useInitialize } from "@/hooks/useInitialize";

const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const init = useInitialize({
    requestTimeoutMs: 15000,
    keepStaleDuringRefresh: true,
    initialFetch: true,
  });

  const {
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
    isReady,
    hasError,
  } = init;

  const value: AuthContextValue = useMemo(
    () => ({
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
      isReady,
      hasError,
    }),
    [
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
      isReady,
      hasError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
