"use client";
import MongoContext from "@/app/MongoContext";
import React, { useContext } from "react";
import * as Realm from "realm-web";
import { useRouter } from "next/navigation";

function ProviderLogout({ children }: { children: React.ReactNode }) {
  const {
    user,
    userData,
    app,
    setUser,
    setClient,
    setLoadingAuth,
    setUserData,
  }: any = useContext(MongoContext);
  const router = useRouter();
  const logout = async () => {
    try {
      if (!user || !app?.currentUser) return;
      await app?.currentUser?.logOut();
      localStorage.clear();
      const anonymousUser = await app?.logIn(Realm.Credentials.anonymous());
      setUser(anonymousUser);
      router.push("/signin");
      setClient(app?.currentUser?.mongoClient("mongodb-atlas"));
      setLoadingAuth(false);
      setUserData({});
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };
  return <div onClick={logout}>{children}</div>;
}

export default ProviderLogout;
