"use client";
import { ReactNode, useEffect, useState } from "react";
import MongoContext from "@/app/MongoContext";
import { useInitialize } from "../app/hooks/useInitialize";
const MongoProvider = ({ children }: { children: ReactNode }) => {
  const {
    app,
    client,
    user,
    userData,
    loadingAuth,
    setCustomerData,
    searchedData,
    setTwilioToken,
    authenticated,
    setAuthenticated,
    twilioToken,
    setLoadingAuth,
    setApp,
    setUser,
    setClient,
    setUserData,
  } = useInitialize();
  // console.log(authenticated)
  return (
    <MongoContext.Provider
      value={{
        app,
        client,
        user,
        twilioToken,
        setCustomerData,
        setTwilioToken,
        setLoadingAuth,
        userData,
        authenticated,
        setAuthenticated,
        loadingAuth,
        setApp,
        setUser,
        setClient,
        setUserData,
      }}
    >
      {children}
    </MongoContext.Provider>
  );
};

export default MongoProvider;
