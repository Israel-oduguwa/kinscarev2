import ExcelCNAAuth from "@/Authentication/ExcelCNAAuth";
import React, { Suspense } from "react";

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExcelCNAAuth />
    </Suspense>
  );
}

export default page;
