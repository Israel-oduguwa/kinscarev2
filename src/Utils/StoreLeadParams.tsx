"use client";
import { useEffect } from "react";

export default function StoreLeadParams({
  zipcode,
  email,
  phone,
}: {
  zipcode?: string;
  email?: string;
  phone?: string;
}) {
  useEffect(() => {
    try {
      if (zipcode) localStorage.setItem("lead_zipcode", zipcode);
      if (email) localStorage.setItem("lead_email", email);
      if (phone) localStorage.setItem("lead_phone", phone);

      // console.log("✅ Lead data saved to localStorage");
    } catch (error) {
      console.error("Failed to store lead data:", error);
    }
  }, [zipcode, email, phone]);

  return null; // no UI rendered
}
