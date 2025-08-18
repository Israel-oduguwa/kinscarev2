"use client";
import MongoContext from "@/app/MongoContext";
import Link from "next/link";
import React, { useContext } from "react";

function JobBackLink() {
  const { userData }: any = useContext(MongoContext);
  return (
    <Link
      href={`${
        userData?.role !== "caregiver" ? "/find-jobs" : "/vitae/jobs/all"
      }`}
      className="text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
    >
      ← Back to jobs
    </Link>
  );
}

export default JobBackLink;
