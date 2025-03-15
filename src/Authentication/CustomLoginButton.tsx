/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useContext } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";
import * as Realm from "realm-web";
import Link from "next/link";
import MongoContext from "@/app/MongoContext";
import { fetchContactsData, fetchUserData, trackEvents } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import ProfileAvatar from "@/components/ProfileAvatar";

// Define TypeScript interfaces for props and state
interface UserInfo {
  profileImage: string | undefined;
  email: string;
  tel: string;
  role: string;
}

interface MongoContext {
  app: any; // Replace 'any' with a more specific type if known
  client: any; // Replace 'any' with a more specific type if known
  setUser: (user: any) => void;
  user: any; // Replace 'any' with a more specific type if known
  userData: any; // Replace 'any' with a more specific type if known
  setUserData: (data: any) => void;
}

// interface CustomLoginButtonProps {
//   mongoContext: MongoContext;
// }

const CustomLoginButton: React.FC = () => {
  const {
    app,
    client,
    setUser,
    user,
    userData,
    setCustomData,
    setUserData,
  }: any = useContext(MongoContext);

  // State with TypeScript types
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Changed from "" to null for better type safety
  const router = useRouter();

  // Fetch user info on mount
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const headers: AxiosRequestConfig["headers"] = {
          "Content-Type": "application/json",
        };
        const response = await axios.get(
          "https://api.kinscare.org/api/v1/auth/get_user_info",
          {
            withCredentials: true, // Important for sending cookies in cross-origin requests
            headers,
          }
        );
        if (response.data) {
          setUserInfo(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const createUserDuringRegistration = async (payload: any) => {
    const decodedToken: any = jwtDecode(payload);
    console.log(decodedToken);
    const payloads = {
      id: decodedToken.userId,
      email: decodedToken.email,
    };
    const credentials = Realm.Credentials.function(payloads);
    console.log(credentials);
    const userObj = await app.logIn(credentials);
    console.log(userObj.profile.name, userObj.id);
    const users = await client.db("kinshealth").collection("contacts").find({
      userID: userObj.id,
      email: userObj.profile.name,
    });
    console.log(users[0]?.returning, "these are users");
    // check if the user already exist
    if (users.length < 1) {
    } else {
      //if the user signing in does not have returning attribute, add it
      console.log("Passed");

      const mixpanelPayload = {
        auth_mode: "otp",
        date_time: new Date().toISOString(),
        route: "Regular",
        email: app.currentUser.profile.name,
      };
      trackEvents(app.currentUser.customData.hash, "Sign In", mixpanelPayload);
      setUser(app.currentUser);
      // console.log("SetUser have fired");
      // we then redirect the user to the dashboard
      app.currentUser.refreshCustomData();
      const userID = app.currentUser.id;
      const emails = app.currentUser.email;
      const user_data: any = await fetchUserData(userID, emails);
      const updatedData: any = await fetchContactsData(userID, emails);
      // console.log(updatedData, "updated cutome Data")
      if (user_data) {
        setCustomData(updatedData.result);
        setUserData(user_data.result); // set the user data
        user.refreshCustomData();
        app.currentUser.refreshCustomData();
        router.refresh();
        // route the user to the appropriate page based on role
      }
      setLoading(false);
    }
  };

  // Handle login action
  const handleLogin = async () => {
    if (!userInfo) return;
    setLoading(true);
    const email = userInfo.email;
    const payload = {
      phoneNumber: userInfo.tel,
      role: userInfo.role,
      email,
    };
    try {
      const jwt_generate = await axios.post("/api/generate_jwt_token", payload);
      // Assuming createUserDuringRegistration is defined elsewhere
      await createUserDuringRegistration(jwt_generate.data.token);
      router.push("/vitae/jobs/all");
      console.log("JWT Generated token d:", jwt_generate.data.token);
    } catch (error) {
      console.log("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate dynamic colors based on name (for avatar)
  const stringToColor = (name: string): string[] => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hexValues = [];
    for (let i = 0; i < 3; i++) {
      hexValues[i] = (hash >> (i * 8)) & 0xff;
    }
    const hue = (hexValues[0] / 255) * 360;
    const saturation = (hexValues[1] / 255) * 60 + 20;
    const lightness = (hexValues[2] / 255) * 60 + 20;
    const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const color2 = `hsl(${hue}, ${saturation + 10}%, ${lightness - 10}%)`;
    const color3 = `hsl(${hue}, ${saturation + 20}%, ${lightness - 20}%)`;
    return [color1, color2, color3];
  };

  // Generate avatar styles dynamically
  const stringAvatar = (name: string) => {
    const colors = stringToColor(name);
    return {
      backgroundImage: `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
      color: "#fff",
      textTransform: "uppercase",
      fontWeight: "bold",
      fontSize: "1.3rem",
      display: "flex",
      width: "30px",
      height: "30px",
      alignItems: "center",
      justifyContent: "center",
    } as React.CSSProperties; // Cast as CSSProperties for TypeScript
  };

  return (
    <div className="w-full max-w-[280px] p-2xs:max-w-[320px] sm:max-w-none mx-auto">
      {loading ? (
        <div className="flex justify-center p-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent" />
        </div>
      ) : userInfo ? (
        <>
          <p className="font-semibold mb-2">
            Coming from excel cna signin using the button below
          </p>
          <div
            className="flex items-center justify-between p-1 xs:p-2 rounded-sm border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={handleLogin}
          >
            <div className="flex items-center gap-1 xs:gap-1 flex-1 min-w-0">
              <ProfileAvatar
                size="w-10 h-10 xs:w-6 xs:h-6"
                name={userInfo.email}
                profileImage={userInfo.profileImage}
              />
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm m-0 p-0 leading-tight xs:text-sm font-medium text-gray-600 truncate">
                  {userInfo.email}
                </p>
                <p className="text-[11px] leading-tight xs:text-xs text-gray-500 capitalize truncate">
                  {userInfo.role}
                </p>
              </div>
            </div>
            <img
              className="h-10 w-10 xs:h-4 xs:w-4 flex-shrink-0"
              src="https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/kins%20logo%201.png?alt=media&token=61b1ccc6-7bab-42e1-86e2-2bc217e8852c"
              alt="Kinscare Logo"
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default CustomLoginButton;

{
  /* <Link href="/auth/signup" className="block w-full">
          <button className="w-full flex items-center justify-between gap-2 px-3 xs:px-4 py-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 shadow-sm transition-colors text-sm xs:text-base font-medium text-gray-700">
            <span className="whitespace-nowrap truncate">
              Sign up with Kinscare
            </span>
            <img
              className="h-5 w-5 xs:h-6 xs:w-6 flex-shrink-0 object-contain"
              src="https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/kins%20logo%201.png?alt=media&token=61b1ccc6-7bab-42e1-86e2-2bc217e8852c"
              alt="Kinscare Logo"
            />
          </button>
        </Link> */
}
