import FindCaregiverLandingPage from "@/WebPages/FindCaregiver/FindCaregiverLandingPage";
import Footer from "@/WebPages/Footer";
import Navbar from "@/WebPages/Navbar";
import React from "react";

function page() {
  return (
    <>
      <Navbar />
      <FindCaregiverLandingPage />
      {/* Footer */}
      <footer className="bg-white text-white py-10">
        <Footer />
      </footer>
    </>
  );
}

export default page;
