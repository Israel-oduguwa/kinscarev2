"use client";
import MongoContext from "@/app/MongoContext";
import { ReactNode } from "react";
import { useInitialize } from "../app/hooks/useInitialize";
const MongoProvider = ({ children }: { children: ReactNode }) => {
  const {
    app,
    client,
    user,
    userData,
    loadingAuth,
    setCustomerData,
    fetchAndUpdateCustomData,
    searchedData,
    setTwilioToken,
    setCustomData,
    customData,
    authenticated,
    setAuthenticated,
    twilioToken,
    setLoadingAuth,
    setUser,
    setClient,
    setUserData,
  } = useInitialize();
  // console.log(authenticated)
  return (
    <MongoContext.Provider
      value={{
        app,
        setCustomData,
        customData,
        client,
        user,
        fetchAndUpdateCustomData,
        twilioToken,
        setCustomerData,
        setTwilioToken,
        setLoadingAuth,
        userData,
        authenticated,
        setAuthenticated,
        loadingAuth,
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
