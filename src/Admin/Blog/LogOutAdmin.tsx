"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";
import * as Realm from "realm-web";

function LogOutAdmin() {
  const mongodb: any = useContext(MongoContext);
  const {
    user,
    userData,
    app,
    setUser,
    setClient,
    setLoadingAuth,
    setUserData,
    customData,
  } = mongodb;
  const router = useRouter();
  const LogOutUser = async () => {
    try {
      if (!user || !app?.currentUser) return;

      // const tagManagerArgs = {
      //   dataLayer: {
      //     event: "sign_out",
      //     added: new Date(),
      //     date_time: new Date().toISOString(),
      //     distinct_id: customData.hash,
      //     role: customData.role,
      //     userId: `${user?.id}`,
      //   },
      // };
      // const payload = {
      //   added: new Date(),
      //   date_time: new Date().toISOString(),
      //   role: customData.role,
      //   userId: `${user?.id}`,
      // };

      // trackEvents(user?.customData?.hash, "Sign Out", payload);
      // TagManager.dataLayer(tagManagerArgs);

      await app?.currentUser?.logOut();
      // localStorage.clear();
      console.log("logout");
      const anonymousUser = await app?.logIn(Realm.Credentials.anonymous());
      setUser(anonymousUser);
      router.push("/admin-login");
      setClient(app?.currentUser?.mongoClient("mongodb-atlas"));
      setLoadingAuth(false);
      setUserData({});
    } catch (error) {
      console.error("An error occurred during logout:", error);
      // Handle the error according to your application's needs
    }
  };
  return (
    <>
      <Button
        variant="destructive"
        className="w-full flex items-center gap-2 mt-3"
        onClick={LogOutUser}
      >
        <LogOut size={20} /> Logout
      </Button>
    </>
  );
}

export default LogOutAdmin;
