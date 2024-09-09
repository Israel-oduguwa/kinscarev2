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
  setApp: React.Dispatch<React.SetStateAction<Realm.App>>;
  setClient: React.Dispatch<React.SetStateAction<MongoClient | null>>;
  setUser: React.Dispatch<React.SetStateAction<Realm.User | null>>;
  setUserData: React.Dispatch<React.SetStateAction<UserCustomData | null>>;
}

const loadingTypes = {
  1: "authenticating",
  2: "anonymous",
  3: "authenticated",
  4: "error",
};

export const useInitialize = (): UseInitializeReturn => {
  const id = process.env.REALM_ID!;
  const config = { id };
  const realmApp = new Realm.App(config);
  const [app, setApp] = useState(realmApp);
  const [client, setClient] = useState<MongoClient | null>(null);
  const [user, setUser] = useState<Realm.User | null>(null);
  const [userData, setUserData] = useState<UserCustomData | null>(null);
  // we have 4 status authenticating, anonymous, authenticated, anonymous, error is for the login and signup page if anonymous and authenticated is there give the user access
  const [loadingAuth, setLoadingAuth] = useState("authenticating");
  const [customerData, setCustomerData] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [searchedData, setSearchedData] = useState<any>(null);
  const [twilioToken, setTwilioToken] = useState("");

  // On an avaerage, it takes 3 seconds for the autthnication to show 

  useEffect(() => {
    const init = async () => {
      setLoadingAuth("authenticating");
      try {
        let currentUser = app.currentUser;
        if (currentUser) {
          setLoadingAuth("anonymous");
        }
        if (!currentUser) {
          currentUser = await app.logIn(Realm.Credentials.anonymous());
          setLoadingAuth("anonymous");
        }
        setUser(currentUser);
        const mongoClient = currentUser.mongoClient(
          "mongodb-atlas"
        ) as MongoClient;
        setClient(mongoClient);
        console.log(currentUser.customData)
        if (currentUser.customData.userID && !isAnon(currentUser)) {
          const userData = await mongoClient
            .db("kinshealth")
            .collection<UserCustomData>("users")
            .findOne({ userID: currentUser.id });
          setUserData(userData);
          if (userData?.hash) {
            // aliasUser(userData.hash);
            // identifyUser(userData.hash);
          }
          setLoadingAuth("authenticated");
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setLoadingAuth("error");
      }
    };

    init();
  }, []);

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
    setApp,
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
