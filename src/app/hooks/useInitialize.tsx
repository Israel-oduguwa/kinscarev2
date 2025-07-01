"use client";

import { useState, useEffect } from "react";
import * as Realm from "realm-web";
import { isAnon } from "@/lib/utils";

interface UserCustomData {
  role?: string;
  [key: string]: any;
}

interface MongoClient {
  db(dbName: string): {
    collection<T>(collectionName: string): {
      findOne(filter: Partial<T>): Promise<T | null>;
    };
  };
}

interface UseInitializeReturn {
  app: Realm.App;
  client: MongoClient | null;
  user: Realm.User | null;
  fetchAndUpdateCustomData: () => Promise<void>;
  userData: UserCustomData | null;
  setCustomerData: React.Dispatch<React.SetStateAction<any>>;
  searchedData: any;
  setSearchedData: React.Dispatch<React.SetStateAction<any>>;
  setCustomData: (data: any) => void;
  customData: any;
  setLoadingAuth: React.Dispatch<React.SetStateAction<boolean>>;
  twilioToken: string;
  setTwilioToken: React.Dispatch<React.SetStateAction<string>>;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  authenticated: boolean;
  customerData: any;
  loadingAuth: boolean;
  setClient: React.Dispatch<React.SetStateAction<MongoClient | null>>;
  setUser: React.Dispatch<React.SetStateAction<Realm.User | null>>;
  setUserData: React.Dispatch<React.SetStateAction<UserCustomData | null>>;
}

export const useInitialize = (): UseInitializeReturn => {
  // 1) ENV VAR GUARD: Make sure REALM_ID is present at runtime
  const realmId = process.env.REALM_ID;
  if (!realmId) {
    throw new Error(
      "Missing environment variable REALM_ID. This must be defined for Realm initialization."
    );
  }

  // 2) Instantiate Realm.App exactly once per hook instance
  const appConfig = { id: realmId };
  const realmApp = new Realm.App(appConfig);

  // 3) Keep the exact same state names you had before:
  const [app] = useState<Realm.App>(realmApp);
  const [client, setClient] = useState<MongoClient | null>(null);
  const [user, setUser] = useState<Realm.User | null>(null);
  const [userData, setUserData] = useState<UserCustomData | null>(null);
  const [customData, setCustomData] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [customerData, setCustomerData] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [searchedData, setSearchedData] = useState<any>(null);
  const [twilioToken, setTwilioToken] = useState<string>("");

  // 4) useEffect with an isMounted guard to avoid updating state after unmount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted) return;
      setLoadingAuth(true);

      try {
        let currentUser = app.currentUser;

        // If a user already exists and is “loggedIn,” refresh its customData.
        // ─────────────────────────────────────────────────────────────────────────────
        // <--- THE ONLY CHANGE HERE: use `currentUser.isLoggedIn` instead of comparing .state to "loggedIn"  -->
        if (currentUser && currentUser.isLoggedIn) {
          try {
            await currentUser.refreshCustomData();
          } catch (e) {
            console.warn("refreshCustomData failed:", e);
          }
        }
        // ─────────────────────────────────────────────────────────────────────────────

        // If no user is currently logged in, log in anonymously
        if (!currentUser) {
          currentUser = await app.logIn(Realm.Credentials.anonymous());
        }

        if (!isMounted) return;
        setUser(currentUser);
        setCustomData(currentUser.customData); // set built-in customData

        // Acquire the MongoDB client
        const mongoClient = currentUser.mongoClient("mongodb-atlas") as MongoClient;
        if (!isMounted) return;
        setClient(mongoClient);

        // If user.customData.userID exists and is not anonymous, fetch “users” doc
        if (currentUser.customData?.userID && !isAnon(currentUser)) {
          // Check if “non-anonymous” by verifying identities array
          const isAnonymous = !currentUser.identities.some(
            (identity: { providerType: string }) =>
              identity.providerType !== "anon-user"
          );

          if (!isAnonymous) {
            try {
              const fetchedUserData = await mongoClient
                .db("kinshealth")
                .collection<UserCustomData>("users")
                .findOne({ userID: currentUser.id });

              if (isMounted && fetchedUserData) {
                setUserData(fetchedUserData);
                setAuthenticated(true);
              }
            } catch (e) {
              console.warn("Failed to fetch userData:", e);
            }
          } else {
            if (isMounted) {
              setAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        if (isMounted) {
          setAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoadingAuth(false);
        }
      }
    };

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, [app]);

  // 5) Function to manually fetch/update “contacts” → this function is unchanged
  const fetchAndUpdateCustomData = async () => {
    if (!user || !client) return;

    try {
      const updatedCustomData = await client
        .db("kinshealth")
        .collection<UserCustomData>("contacts")
        .findOne({ userID: user.id });

      if (updatedCustomData) {
        setCustomData(updatedCustomData);
      }
    } catch (error) {
      console.error("Failed to fetch and update custom data:", error);
    }
  };

  // 6) Return exactly the same keys you had before—no renames or removals:
  return {
    app,
    client,
    user,
    userData,
    customData,
    setCustomerData,
    setCustomData,
    searchedData,
    setSearchedData,
    setLoadingAuth,
    twilioToken,
    setTwilioToken,
    customerData,
    setAuthenticated,
    authenticated,
    loadingAuth,
    setClient,
    setUser,
    setUserData,
    fetchAndUpdateCustomData,
  };
};
