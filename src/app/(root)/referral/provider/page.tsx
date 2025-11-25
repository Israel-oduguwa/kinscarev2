
import Navbar from "@/WebPages/Navbar";
import React, { Suspense } from "react";
async function page({
  searchParams,
}: {
  searchParams: { shifts?: string; licenses?: string };
}) {
  const { shifts, licenses }: any = await searchParams;
  return (
   <div className="mt-10">
     <Navbar/>
   </div>
  );
}

export default page;
