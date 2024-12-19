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
  userData: UserCustomData | null;
  setCustomerData: React.Dispatch<React.SetStateAction<any>>;
  searchedData: any;
  setSearchedData: React.Dispatch<React.SetStateAction<any>>;
  setLoadingAuth: React.Dispatch<React.SetStateAction<string>>;
  twilioToken: string;
  setTwilioToken: React.Dispatch<React.SetStateAction<string>>;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  authenticated: boolean;
  customerData: any;
  loadingAuth: string;
  // setApp: React.Dispatch<React.SetStateAction<Realm.App>>;
  setClient: React.Dispatch<React.SetStateAction<MongoClient | null>>;
  setUser: React.Dispatch<React.SetStateAction<Realm.User | null>>;
  setUserData: React.Dispatch<React.SetStateAction<UserCustomData | null>>;
}

// const loadingTypes = {
//   1: "authenticating",
//   2: "anonymous",
//   3: "authenticated",
//   4: "error",
// };

export const useInitialize = (): UseInitializeReturn => {
  const realmId = process.env.REALM_ID!;
  const appConfig = { id: realmId };
  const realmApp = new Realm.App(appConfig);

  const [app] = useState<any>(realmApp);

  const [client, setClient] = useState<MongoClient | null>(null);
  const [user, setUser] = useState<Realm.User | null>(null);
  const [userData, setUserData] = useState<UserCustomData | null>(null);
  // we have 4 status authenticating, anonymous, authenticated, anonymous, error is for the login and signup page if anonymous and authenticated is there give the user access
  const [loadingAuth, setLoadingAuth] = useState<any>(true);
  const [customerData, setCustomerData] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [searchedData, setSearchedData] = useState<any>(null);
  const [twilioToken, setTwilioToken] = useState("");

  // On an average, it takes 3 seconds for the authentication to show
  useEffect(() => {
    const initializeAuth = async () => {
      setLoadingAuth(true);
      try {
        let currentUser = app.currentUser;

        // log in anonymously if no user is logged in
        if (!currentUser) {
          currentUser = await app.logIn(Realm.Credentials.anonymous());
        }
        setUser(currentUser);
        const mongoClient = currentUser.mongoClient(
          "mongodb-atlas"
        ) as MongoClient;
        setClient(mongoClient);

        if (currentUser.customData?.userID && !isAnon(currentUser)) {
          // check if the user user is authenticated
          const isAnonymous = !currentUser.identities.some(
            (identity: { providerType: string }) =>
              identity.providerType !== "anon-user"
          );
          if (!isAnonymous) {
            const fetchedUserData = await mongoClient
              .db("kinshealth")
              .collection<UserCustomData>("users")
              .findOne({ userID: currentUser.id });
            if (fetchedUserData) {
              setUserData(fetchedUserData);
              setAuthenticated(true);
            }
          } else {
            setAuthenticated(false); // User is anonymous
          }
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        setAuthenticated(false);
      } finally {
        setLoadingAuth(false);
        // loading is complete
      }
    };
    initializeAuth();
  }, [app]);

  return {
    app,
    client,
    user,
    setLoadingAuth,
    userData,
    setCustomerData,
    searchedData,
    setSearchedData,
    twilioToken,
    setTwilioToken,
    customerData,
    setAuthenticated,
    authenticated,
    loadingAuth,
    setClient,
    setUser,
    setUserData,
  };
};

// const userId = userData.userID;
// const anonymousUserId = localStorage.getItem("anonymous");
// if (!anonymousUserId) {
//   const anonymousUserId = generateUUID(); // Replace with the actual anonymous user ID from MongoDB
//   localStorage.setItem("anonymous", anonymousUserId);
//   identifyUser(anonymousUserId);
// }
