"use client";

import React from "react";
const MongoContext: any = React.createContext({
  // States

  authenticated: false, // the state of authentication
  app: null,
  client: null,
  user: {}, // change to object
  userData: {}, //,null,
  twilioToken: "", // twilio Token
  loadingAuth: true,
  searchedData: null,
  customerData: null,
  history: "",

  // Functions

  setHistory: () => {}, // This is for Page tracking
  // for Authentication
  setAuthenticated: () => {},
  // Set the loading state when fetching authenticated data for signed in user
  setLoadingAuth: () => {},
  // Set Loading State for Twilio Users
  setTwilioToken: () => {},
  // set users Data
  setCustomerData: () => {},
  setApp: () => {},
  setClient: () => {},
  setUser: () => {},
  setUserData: () => {},
  // For finding candidates
  setSearchedData: () => {},
});

export default MongoContext;
