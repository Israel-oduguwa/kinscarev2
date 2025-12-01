import Footer from "@/WebPages/Footer";
import Navbar from "@/WebPages/Navbar";
import { Metadata } from "next";
import Head from "next/head";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Kinscare",
  description:
    "View the terms and conditions for using Kinscare's website and related services. Understand your rights and responsibilities.",
  openGraph: {
    title: "Terms of Service - Kinscare",
    description:
      "View the terms and conditions for using Kinscare's website and related services. Understand your rights and responsibilities.",
    url: "https://www.kinscare.org/terms",
    siteName: "Kinscare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Kinscare",
    description:
      "View the terms and conditions for using Kinscare's website and related services. Understand your rights and responsibilities.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const Terms = () => {
  return (
    <>
   
    <div className="mt-10">
    <div className="  pt-20 pb-10 px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <p className="mb-6 text-gray-700">
          These terms and conditions ("Agreement") set forth the general terms
          and conditions of your use of the{" "}
          <Link
            href="https://www.kinscare.org"
            className="text-blue-600 underline"
          >
            kinscare.org
          </Link>{" "}
          website ("Website" or "Service") and any of its related products and
          services (collectively, "Services"). This Agreement is legally binding
          between you ("User", "you" or "your") and Kinscare ("Kinscare", "we",
          "us" or "our"). If you are entering into this agreement on behalf of a
          business or other legal entity, you represent that you have the
          authority to bind such entity to this agreement, in which case the
          terms "User", "you" or "your" shall refer to such entity. If you do
          not have such authority, or if you do not agree with the terms of this
          agreement, you must not accept this agreement and may not access and
          use the Website and Services. By accessing and using the Website and
          Services, you acknowledge that you have read, understood, and agree to
          be bound by the terms of this Agreement.
        </p>
        <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
        <ul className="list-disc pl-6 mb-8">
          <li>
            <Link
              href="#accounts-and-membership"
              className="text-blue-600 underline"
            >
              1. Accounts and Membership
            </Link>
          </li>
          <li>
            <Link
              href="#billing-and-payments"
              className="text-blue-600 underline"
            >
              2.Billing and Payments
            </Link>
          </li>
          <li>
            <Link
              href="#accuracy-of-information"
              className="text-blue-600 underline"
            >
             3. Accuracy of Information
            </Link>
          </li>
          <li>
            <Link href="#uptime-guarantee" className="text-blue-600 underline">
             4. Uptime Guarantee
            </Link>
          </li>
          <li>
            <Link
              href="#links-to-other-resources"
              className="text-blue-600 underline"
            >
            5.  Links to Other Resources
            </Link>
          </li>
          <li>
            <Link
              href="#changes-and-amendments"
              className="text-blue-600 underline"
            >
              6. Changes and Amendments
            </Link>
          </li>
          <li>
            <Link
              href="#acceptance-of-these-terms"
              className="text-blue-600 underline"
            >
            7. Acceptance of These Terms
            </Link>
          </li>
          <li>
            <Link href="#contacting-us" className="text-blue-600 underline">
            8.  Contacting Us
            </Link>
          </li>
        </ul>

        <section id="accounts-and-membership" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            1. Accounts and Membership
          </h3>
          <p className="mb-4 text-gray-700">
            If you create an account on the Website, you are responsible for
            maintaining the security of your account and you are fully
            responsible for all activities that occur under the account and any
            other actions taken in connection with it. We may, but have no
            obligation to, monitor and review new accounts before you may sign
            in and start using the Services. Providing false contact information
            of any kind may result in the termination of your account.
          </p>
          <p className="text-gray-700">
            You must immediately notify us of any unauthorized uses of your
            account or any other breaches of security. We will not be liable for
            any acts or omissions by you, including any damages of any kind
            incurred as a result of such acts or omissions. We may suspend,
            disable, or delete your account if we determine that you have
            violated any provision of this Agreement or that your conduct would
            tend to damage our reputation. If we delete your account, you may
            not re-register. We may block your email and IP address to prevent
            further registration.
          </p>
        </section>

        <section id="billing-and-payments" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">2. Billing and Payments</h3>
          <p className="mb-4 text-gray-700">
            You shall pay all fees or charges to your account in accordance with
            the fees, charges, and billing terms in effect at the time a fee or
            charge is due and payable. If auto-renewal is enabled for the
            Services you have subscribed to, you will be charged automatically
            in accordance with the term you selected.
          </p>
          <p className="text-gray-700">
            If your transaction is flagged as high-risk, we may require
            additional verification, such as government ID or bank statements.
            We reserve the right to change product pricing at any time and
            refuse or cancel orders at our discretion.
          </p>
        </section>

        <section id="accuracy-of-information" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            3. Accuracy of Information
          </h3>
          <p className="text-gray-700">
            Occasionally, there may be information on the Website that contains
            typographical errors, inaccuracies, or omissions. We reserve the
            right to correct these errors and update or cancel orders without
            prior notice. We undertake no obligation to update or clarify
            information except as required by law.
          </p>
        </section>

        <section id="uptime-guarantee" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">4. Uptime Guarantee</h3>
          <p className="text-gray-700">
            We offer a 99% uptime guarantee for our Services. This guarantee
            does not apply to outages caused by maintenance, user actions, or
            other circumstances beyond our control.
          </p>
        </section>

        <section id="links-to-other-resources" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            5. Links to Other Resources
          </h3>
          <p className="text-gray-700">
            The Website and Services may link to other resources. However, we do
            not endorse or assume responsibility for any third-party content,
            services, or actions. Accessing third-party resources is at your own
            risk.
          </p>
        </section>

        <section id="changes-and-amendments" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">6. Changes and Amendments</h3>
          <p className="text-gray-700">
            We reserve the right to modify this Agreement or its terms at any
            time. When changes are made, we may notify you via email or other
            contact methods. Continued use of the Website after changes
            indicates your acceptance of the updated terms.
          </p>
        </section>

        <section id="acceptance-of-these-terms" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            7. Acceptance of These Terms
          </h3>
          <p className="text-gray-700">
            By accessing and using the Website, you agree to be bound by this
            Agreement. If you do not agree, you are not authorized to use the
            Website and Services.
          </p>
        </section>

        <section id="contacting-us" className="mb-8">
          <h3 className="text-xl font-semibold mb-4">8. Contacting Us</h3>
          <p className="text-gray-700">
            If you have any questions about this Agreement, please contact us at{" "}
            <Link
              href="mailto:feedback@kinscare.org"
              className="text-blue-600 underline"
            >
              feedback@kinscare.org
            </Link>
            .
          </p>
          <p className="text-gray-700">
            This document was last updated on September 3, 2022.
          </p>
        </section>
      </div>
    </div>
      
    </>
  );
};

export default Terms;
