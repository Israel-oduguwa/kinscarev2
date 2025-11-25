/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader, Loader2, Mail, Phone, UserCheck } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import axios from "axios";
import { useApiClient } from "@/hooks/useApiClient";

export default function WelcomeDialog() {
  const { userData, contactData }: any = useAuthContext(); // Access MongoContext for contactData
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
    const {privateApi} = useApiClient()
  // Ensure the modal only opens if `contactData.complete` is true
  React.useEffect(() => {
    if (
      !contactData?.complete &&
      contactData?.signup_route === "caregiver" &&
      !contactData.welcome_read
    ) {
      // console.log("hi");
      setIsOpen(true); // Open the modal
    } else {
      setIsOpen(false); // Ensure it's closed
    }
  }, [contactData?.complete]); // Run this effect whenever `contactData.complete` changes

  // If `contactData.complete` is false, don't render the Dialog at all
  if (contactData?.complete) return null;

  const startHiring = async () => {
    try {
      setLoading(true);
      const userID = contactData.userID;
      const payload = {
        collectionName: "contacts",
        operation: "updateOne",
        filter: { userID, role: "provider" },
        update: {
          $set: {
            welcome_read: true,
          },
        },
      };
      const readWelcome = await privateApi.post(
        "/api/v1/auth/crud-operation",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      //   console.log(readWelcome)
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };
console.log(isOpen)
  return (
    <Dialog open={isOpen}>
      <DialogContent className="rounded-xl border  [&>button]:hidden border-gray-200  sm:max-w-xl animate-fade-in">
        {/* Decorative Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100 via-purple-50 to-blue-50 opacity-30 rounded-xl"></div>

        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-2xl  font-extrabold flex space-x-2 text-gray-900 tracking-tight">
            Welcome to<span className="text-blue-600 ml-1"> Kinscare</span>!
            <span className="[&_svg]:size-9">
              <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="m4.861 9.147c.94-.657 2.357-.531 3.201.166l-.968-1.407c-.779-1.111-.5-2.313.612-3.093 1.112-.777 4.263 1.312 4.263 1.312-.786-1.122-.639-2.544.483-3.331 1.122-.784 2.67-.513 3.456.611l10.42 14.72-1.328 12.875-11.083-4.042-9.667-14.333c-.793-1.129-.519-2.686.611-3.478z"
                  fill="#ef9645"
                />
                <path
                  d="m2.695 17.336s-1.132-1.65.519-2.781c1.649-1.131 2.78.518 2.78.518l5.251 7.658c.181-.302.379-.6.6-.894l-7.288-10.627s-1.131-1.649.519-2.78c1.649-1.131 2.78.518 2.78.518l6.855 9.997c.255-.208.516-.417.785-.622l-7.947-11.591s-1.131-1.649.519-2.78c1.649-1.131 2.78.518 2.78.518l7.947 11.589c.292-.179.581-.334.871-.498l-7.428-10.832s-1.131-1.649.518-2.78 2.78.518 2.78.518l7.854 11.454 1.194 1.742c-4.948 3.394-5.419 9.779-2.592 13.902.565.825 1.39.26 1.39.26-3.393-4.949-2.357-10.51 2.592-13.903l-1.459-7.302s-.545-1.924 1.378-2.47c1.924-.545 2.47 1.379 2.47 1.379l1.685 5.004c.668 1.984 1.379 3.961 2.32 5.831 2.657 5.28 1.07 11.842-3.94 15.279-5.465 3.747-12.936 2.354-16.684-3.11z"
                  fill="#ffdc5d"
                />
                <g fill="#5dadec">
                  <path d="m12 32.042c-4 0-8.042-4.042-8.042-8.042 0-.553-.405-1-.958-1s-1.042.447-1.042 1c0 6 4.042 10.042 10.042 10.042.553 0 1-.489 1-1.042s-.447-.958-1-.958z" />
                  <path d="m7 34c-3 0-5-2-5-5 0-.553-.447-1-1-1s-1 .447-1 1c0 4 3 7 7 7 .553 0 1-.447 1-1s-.447-1-1-1zm17-32c-.552 0-1 .448-1 1s.448 1 1 1c4 0 8 3.589 8 8 0 .552.448 1 1 1s1-.448 1-1c0-5.514-4-10-10-10z" />
                  <path d="m29 .042c-.552 0-1 .406-1 .958s.448 1.042 1 1.042c3 0 4.958 2.225 4.958 4.958 0 .552.489 1 1.042 1s.958-.448.958-1c0-3.837-2.958-6.958-6.958-6.958z" />
                </g>
              </svg>
            </span>
          </DialogTitle>
          <p className="mt-3 text-gray-700 ">
            Get started with Kinscare, your go-to platform for connecting with
            top caregivers. Here’s what you can do:
          </p>
        </DialogHeader>

        {/* Features List */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <span className="text-gray-700 ">
              <strong>Post job openings</strong> easily.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-600" />
            <span className="text-gray-700 ">
              <strong>Contact caregivers</strong> directly via phone or email.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <span className="text-gray-700 ">
              <strong> Find the right match quickly</strong> with our
              streamlined process
            </span>
          </div>
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
          <Button disabled={loading} onClick={startHiring}>{loading && <Loader className="animate-spin"/>} Find Caregivers </Button>
          {/* <Button
            variant="ghost"
            className="w-full sm:w-auto text-blue-600 hover:text-blue-700 hover:underline decoration-2"
            onClick={() => setIsOpen(false)}
          >
            Learn More
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
