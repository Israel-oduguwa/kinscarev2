import ContactUs from "@/CustomerFeeback/ContactUsPage";
import Footer from "@/WebPages/Footer";
import Navbar from "@/WebPages/Navbar";
import { Metadata } from "next";
import Head from "next/head";
import Link from "next/link";

export const metadata: Metadata = {
  title: "contact us - Kinscare",
  description:
    "contact kinscare, send feedbacks and issue to kinscare for fixing",
  openGraph: {
    title: "contact us - Kinscare",
    description:
      "contact kinscare, send feedbacks and issue to kinscare for fixing",
    url: "https://www.kinscare.org/contact",
    siteName: "Kinscare",
  },
  twitter: {
    card: "summary_large_image",
    title: "contact us - Kinscare",
    description:
      "contact kinscare, send feedbacks and issue to kinscare for fixing",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const Contact = () => {
  return (
    <>
      <Navbar />
      <div className="mt-10">
        <ContactUs />
      </div>
      <Footer />
    </>
  );
};

export default Contact;
