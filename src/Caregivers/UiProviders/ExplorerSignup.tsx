"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SignUp, useAuth, useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";

type UnsafeMeta = {
  userIp: string | null;
  zipcode: string | null;
  address: string | null;
  geocode_address: { lng: number; lat: number } | null;
  city: string | null;
  returning: boolean;
  apply_metadata:boolean;
  role: "caregiver";
  signup_route: "explorer";
};

const ExplorerSignup = ({ setDialog, setChat }: any) => {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  const [unsafeMeta, setUnsafeMeta] = useState<UnsafeMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);

  const didFinalizeRef = useRef(false);

  // 1) Fetch geo/IP and build unsafeMetadata
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setMetaLoading(true);
        const res = await axios.get("/api/ip");
        const data = res?.data || {};

        const {
          zip,
          city,
          latitude,
          longitude,
          country_code,
          region_name,
          ip,
        } = data;

        const meta: UnsafeMeta = {
          userIp: ip ?? null,
          zipcode: zip ?? null,
          address:
            city && region_name && country_code
              ? `${city}, ${region_name}, ${country_code}`
              : null,
          geocode_address:
            latitude != null && longitude != null
              ? { lng: longitude, lat: latitude }
              : null,
          city: city ?? null,
          returning: false,
          role: "caregiver",
          apply_metadata:true,
          signup_route: "explorer",

        };

        if (mounted) setUnsafeMeta(meta);
      } catch (e) {
        console.error("Failed to load /api/ip:", e);
        // Still allow signup even if geo fails
        if (mounted) {
          setUnsafeMeta({
            userIp: null,
            apply_metadata:true,
            zipcode: null,
            address: null,
            geocode_address: null,
            city: null,
            returning: false,
            role: "caregiver",
            signup_route: "explorer",
          });
        }
      } finally {
        if (mounted) setMetaLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 2) After Clerk signs user in, save recommendation + redirect + close dialog
  useEffect(() => {
    if (!authLoaded || !userLoaded) return;
    if (!isSignedIn || !user?.id) return;
    if (didFinalizeRef.current) return;

    didFinalizeRef.current = true;

    (async () => {
      try {
        const aiRecommendation = JSON.parse(
          localStorage.getItem("ai_recommendation") || "null"
        );

        if (aiRecommendation) {
          const savePayload = {
            userID: user.id,
            recommendations: aiRecommendation,
          };

          await fetch("/api/v1/caregivers/save-recommendation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(savePayload),
          });
        }
      } catch (err) {
        console.error("Failed to save recommendation:", err);
        // don't block redirect
      } finally {
        router.push("/vitae/career-plan");
        setChat(false);
        setDialog(false);
      }
    })();
  }, [authLoaded, userLoaded, isSignedIn, user?.id, router, setChat, setDialog]);

  // If already signed in, show spinner while effect runs
  if (authLoaded && userLoaded && isSignedIn) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2Icon size={28} className="animate-spin" />
      </div>
    );
  }

  // Wait for unsafeMetadata to load before rendering SignUp
  if (metaLoading || !unsafeMeta) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2Icon size={28} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-center font-bold text-gray-800 drop-shadow-sm">
        Complete Your Profile to Unlock Your Best-Fit Program
      </h3>
      <p className="text-sm text-center text-gray-600 mb-4">
        We’ve matched you to a top program—finish signing up to view full
        details, save your recommendation
      </p>

      <SignUp
        unsafeMetadata={unsafeMeta}
        signInUrl="/signin"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-0 p-0 w-full",
          },
        }}
      />
    </div>
  );
};

export default ExplorerSignup;
