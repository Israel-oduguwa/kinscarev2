"use client";
import MongoContext from "@/app/MongoContext";
import { fetchContactsData, fetchUserData, trackEvents } from "@/lib/utils";
import axios, { AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useContext, useEffect, useState } from "react";
import TagManager from "react-gtm-module";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "@/Providers/DashboardSkelenton";
import * as Realm from "realm-web";
function ExcelCNAAuth() {
  const {
    userData,
    user,
    client,
    app,
    setUserData,
    setUser,
    setCustomData,
    setAuthenticated,
    customData,
  }: any = useContext(MongoContext);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const signup = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashedUserData = params.get("hashedUserData");
      const token = params.get("token");
      const csrfToken = params.get("kincaret");

      const createUserDuringRegistration = async (payload: any) => {
        const decodedToken: any = jwtDecode(payload);
        // console.log(decodedToken);
        const payloads = {
          id: decodedToken.userId,
          email: decodedToken.email,
        };
        const credentials = Realm.Credentials.function(payloads);
        // console.log(credentials);
        const userObj = await app.logIn(credentials);
        // console.log(userObj);
        const users = await client
          .db("kinshealth")
          .collection("contacts")
          .find({
            userID: userObj.id,
            email: userObj.profile.name,
          });
        // console.log(user);
        // console.log(users[0]?.returning, "these are users");
        const hashedUserData = decodedToken.hashedUserData;
        // console.log(hashedUserData);
        // check if the user already exist
        if (users.length < 1) {
          const data_payload = {
            email: app.currentUser.profile.name,
            userID: app.currentUser.id,
            role: decodedToken.role,
            tel: decodedToken.phoneNumber,
            fname: decodedToken.fname,
            lname: decodedToken.lname,
            auth_mode: "otp",
            route: "Regular",
            created: new Date(),
            otp_hash: hashedUserData,
          };
          // if the user have not created the account before create the user
          // add some data into the object
          // get the user Ip address and get the city, address and state
          const response = await axios.get("/api/ip");
          if (response.data) {
            const {
              ip,
              city,
              latitude,
              longitude,
              country_code,
              region_name,
              zip,
            } = response.data;
            // if the address is gotten
            Object.assign(data_payload, {
              route: "excel_cna", // excel_cna
              // assign all the rest data
              zipcode: zip,
              userIp: ip,
              address: `${city}, ${region_name}, ${country_code}`,
              geocode_address: {
                lng: longitude,
                lat: latitude,
              },
              city: city,
              returning: false,
            });
            // call with function
            // console.log(data_payload);
            const createUser = await axios.post(
              "https://api.kinscare.org/api/v1/auth/create_user",
              data_payload
            );

            // console.log(segment_tracking);
            //refresh current user
            await app.currentUser.refreshCustomData();
            trackEvents(
              app.currentUser.customData.hash,
              "Sign Up",
              data_payload
            );
            //set user
            setUser(app.currentUser);
            // //register user
            //update user's data
            const tagManagerArgs =
              data_payload.auth_mode === "local-userpass"
                ? {
                    dataLayer: {
                      event: `${data_payload.role}_sign_up`,
                      userIp: response?.data?.userIp,
                      added: new Date(),
                      authEmail: data_payload.email,
                      authMode: data_payload.auth_mode,
                      authTel: data_payload.tel.trim(),
                      role: `${data_payload.role}`,
                      type: "Web",
                      userId: `${userObj.id}`,
                    },
                  }
                : {
                    dataLayer: {
                      event: `otp_sign_up`,
                      added: new Date(),
                      userIp: response?.data?.userIp,
                      authEmail: data_payload.email,
                      authMode: data_payload.auth_mode,
                      socialFname: data_payload.fname,
                      socialLname: data_payload.lname,
                      type: "Web",
                      userId: `${userObj.id}`,
                    },
                  };
            TagManager.dataLayer(tagManagerArgs);
            setAuthenticated(true);

            const userID = app.currentUser.id;
            const emails = app.currentUser.email;
            const user_data: any = await fetchUserData(userID, emails);
            const updatedData: any = await fetchContactsData(userID, emails);
            if (user_data) {
              // console.log(user_data)
              setCustomData(updatedData.result);
              setUserData(user_data.result); // set the user data
              user.refreshCustomData();
              app.currentUser.refreshCustomData();
              router.refresh();
              // route the user to the appropriate page based on role
            }
          }
        } else {
          //if the user signing in does not have returning attribute, add it
          console.log("Passed");
          if (!users[0]?.returning) {
            await client
              .db("kinshealth")
              .collection("users")
              .updateOne(
                { userID: app.currentUser.id },
                { $set: { returning: true } },
                { upsert: true }
              );
          }
          const mixpanelPayload = {
            auth_mode: "otp",
            date_time: new Date().toISOString(),
            route: "Regular",
            email: app.currentUser.profile.name,
          };
          trackEvents(
            app.currentUser.customData.hash,
            "Sign In",
            mixpanelPayload
          );
          setUser(app.currentUser);
          // console.log("SetUser have fired");
          // we then redirect the user to the dashboard
          app.currentUser.refreshCustomData();
          //   then route the user to the dashboard
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
        }
      };

      const signupUser = async () => {
        setLoading(true);
        const payload = {
          csrfToken,
          hashedUserData,
        };
        try {
          const headers: AxiosRequestConfig["headers"] = {
            "Content-Type": "application/json",
          };
          console.log(payload);
          const checkCSRF = await axios.post(
            "https://api.kinscare.org/api/v1/auth/signin_users_from_excelcna",
            payload,
            {
              withCredentials: true, // Important for sending cookies in cross-origin requests
              headers,
            }
          );
          // console.log(checkCSRF);
          if (checkCSRF.data.tokenValid) {
            // sign in the user
            await createUserDuringRegistration(token);
            router.push("/vitae/jobs/all");
            setLoading(false);
          } else {
            console.log("not valid");
          }
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      };

      signupUser();
    };
    if (client) {
      signup();
    }
  }, [client]);
  return <>{loading && <DashboardSkeleton />}</>;
}

export default ExcelCNAAuth;
