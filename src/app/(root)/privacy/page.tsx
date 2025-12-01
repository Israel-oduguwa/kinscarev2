import Navbar from "@/WebPages/Navbar";
import React from "react";

import { Metadata } from "next";
import Footer from "@/WebPages/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Kinscare",
  description:
    "Kinscare respects your privacy and is committed to protecting your personal information through compliance with this privacy policy.",
  openGraph: {
    title: "Privacy Policy - Kinscare",
    description:
      "Kinscare respects your privacy and is committed to protecting your personal information through compliance with this privacy policy.",
    url: "https://www.kinscare.org/privacy-policy",
    siteName: "Kinscare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Kinscare",
    description:
      "Kinscare respects your privacy and is committed to protecting your personal information through compliance with this privacy policy.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      
      <div className="max-w-4xl mt-10 mx-auto my-8 py-20 px-4">
        {/* Page Header */}
        <header>
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        </header>

        {/* Introduction */}
        <p className="mb-4">
          We respect your privacy and are committed to protecting it through our
          compliance with this privacy policy (“Policy”). This Policy describes
          the types of information we may collect from you or that you may
          provide (“Personal Information”) on the{" "}
          <a
            href="https://www.kinscare.org"
            className="text-blue-600 underline"
          >
            kinscare.org
          </a>{" "}
          website (“Website” or “Service”) and any of its related products and
          services (collectively, “Services”), and our practices for collecting,
          using, maintaining, protecting, and disclosing that Personal
          Information. It also describes the choices available to you regarding
          our use of your Personal Information and how you can access and update
          it.
        </p>
        <p className="mb-4">
          This Policy is a legally binding agreement between you (“User”, “you”
          or “your”) and Kinscare (“Kinscare”, “we”, “us” or “our”). If you are
          entering into this agreement on behalf of a business or other legal
          entity, you represent that you have the authority to bind such entity
          to this agreement, in which case the terms “User”, “you” or “your”
          shall refer to such entity. If you do not have such authority, or if
          you do not agree with the terms of this agreement, you must not accept
          this agreement and may not access and use the Website and Services. By
          accessing and using the Website and Services, you acknowledge that you
          have read, understood, and agree to be bound by the terms of this
          Policy. This Policy does not apply to the practices of companies that
          we do not own or control, or to individuals that we do not employ or
          manage.
        </p>

        {/* Table of Contents */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Table of Contents</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <a
                href="#collection-of-personal-information"
                className="text-blue-600 underline"
              >
                Collection of personal information
              </a>
            </li>
            <li>
              <a
                href="#privacy-of-children"
                className="text-blue-600 underline"
              >
                Privacy of children
              </a>
            </li>
            <li>
              <a
                href="#use-and-processing-of-collected-information"
                className="text-blue-600 underline"
              >
                Use and processing of collected information
              </a>
            </li>
            <li>
              <a href="#payment-processing" className="text-blue-600 underline">
                Payment processing
              </a>
            </li>
            <li>
              <a
                href="#managing-information"
                className="text-blue-600 underline"
              >
                Managing information
              </a>
            </li>
            <li>
              <a
                href="#disclosure-of-information"
                className="text-blue-600 underline"
              >
                Disclosure of information
              </a>
            </li>
            <li>
              <a
                href="#retention-of-information"
                className="text-blue-600 underline"
              >
                Retention of information
              </a>
            </li>
            <li>
              <a
                href="#california-privacy-rights"
                className="text-blue-600 underline"
              >
                California privacy rights
              </a>
            </li>
            <li>
              <a
                href="#how-to-exercise-your-rights"
                className="text-blue-600 underline"
              >
                How to exercise your rights
              </a>
            </li>
            <li>
              <a href="#data-analytics" className="text-blue-600 underline">
                Data analytics
              </a>
            </li>
            <li>
              <a
                href="#do-not-track-signals"
                className="text-blue-600 underline"
              >
                Do Not Track signals
              </a>
            </li>
            <li>
              <a href="#advertisements" className="text-blue-600 underline">
                Advertisements
              </a>
            </li>
            <li>
              <a
                href="#links-to-other-resources"
                className="text-blue-600 underline"
              >
                Links to other resources
              </a>
            </li>
            <li>
              <a
                href="#information-security"
                className="text-blue-600 underline"
              >
                Information security
              </a>
            </li>
            <li>
              <a href="#data-breach" className="text-blue-600 underline">
                Data breach
              </a>
            </li>
            <li>
              <a
                href="#changes-and-amendments"
                className="text-blue-600 underline"
              >
                Changes and amendments
              </a>
            </li>
            <li>
              <a
                href="#acceptance-of-this-policy"
                className="text-blue-600 underline"
              >
                Acceptance of this policy
              </a>
            </li>
            <li>
              <a href="#contacting-us" className="text-blue-600 underline">
                Contacting us
              </a>
            </li>
          </ol>
        </section>

        {/* Section 1: Collection of Personal Information */}
        <section id="collection-of-personal-information" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Collection of personal information
          </h2>
          <p className="mb-4">
            You can access and use the Website and Services without telling us
            who you are or revealing any information by which someone could
            identify you as a specific, identifiable individual. If, however,
            you wish to use some of the features offered on the Website, you may
            be asked to provide certain Personal Information (for example, your
            name and e-mail address).
          </p>
          <p className="mb-4">
            We receive and store any information you knowingly provide to us
            when you create an account, publish content, make a purchase, or
            fill any forms on the Website. When required, this information may
            include the following:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>
              Contact information (such as email address, phone number, etc)
            </li>
            <li>
              Basic personal information (such as name, country of residence,
              etc)
            </li>
            <li>
              Any other materials you willingly submit to us (such as articles,
              images, feedback, etc)
            </li>
          </ul>
          <p className="mb-4">
            Some of the information we collect is directly from you via the
            Website and Services. However, we may also collect Personal
            Information about you from other sources such as social media
            platforms, public databases, third-party data providers, and our
            joint partners. Personal Information we collect from other sources
            may include demographic information, such as age and gender, device
            information, such as IP addresses, location, such as city and state,
            and online behavioral data, such as information about your use of
            social media websites, page view information and search results and
            links.
          </p>
          <p className="mb-4">
            You can choose not to provide us with your Personal Information, but
            then you may not be able to take advantage of some of the features
            on the Website. Users who are uncertain about what information is
            mandatory are welcome to contact us.
          </p>
        </section>

        {/* Section 2: Privacy of Children */}
        <section id="privacy-of-children" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Privacy of children
          </h2>
          <p className="mb-4">
            We do not knowingly collect any Personal Information from children
            under the age of 18. If you are under the age of 18, please do not
            submit any Personal Information through the Website and Services. If
            you have reason to believe that a child under the age of 18 has
            provided Personal Information to us through the Website and
            Services, please contact us to request that we delete that child’s
            Personal Information from our Services.
          </p>
          <p>
            We encourage parents and legal guardians to monitor their children’s
            Internet usage and to help enforce this Policy by instructing their
            children never to provide Personal Information through the Website
            and Services without their permission. We also ask that all parents
            and legal guardians overseeing the care of children take the
            necessary precautions to ensure that their children are instructed
            to never give out Personal Information when online without their
            permission.
          </p>
        </section>

        {/* Section 3: Use and Processing of Collected Information */}
        <section
          id="use-and-processing-of-collected-information"
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">
            3. Use and processing of collected information
          </h2>
          <p className="mb-4">
            We act as a data controller and a data processor when handling
            Personal Information, unless we have entered into a data processing
            agreement with you in which case you would be the data controller
            and we would be the data processor.
          </p>
          <p className="mb-4">
            Our role may also differ depending on the specific situation
            involving Personal Information. We act in the capacity of a data
            controller when we ask you to submit your Personal Information that
            is necessary to ensure your access and use of the Website and
            Services. In such instances, we are a data controller because we
            determine the purposes and means of the processing of Personal
            Information.
          </p>
          <p className="mb-4">
            We act in the capacity of a data processor in situations when you
            submit Personal Information through the Website and Services. We do
            not own, control, or make decisions about the submitted Personal
            Information, and such Personal Information is processed only in
            accordance with your instructions. In such instances, the User
            providing Personal Information acts as a data controller.
          </p>
          <p className="mb-4">
            In order to make the Website and Services available to you, or to
            meet a legal obligation, we may need to collect and use certain
            Personal Information. If you do not provide the information that we
            request, we may not be able to provide you with the requested
            products or services. Any of the information we collect from you may
            be used for the following purposes:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>Create and manage user accounts</li>
            <li>Deliver products or services</li>
            <li>Improve products and services</li>
            <li>Run and operate the Website and Services</li>
          </ul>
          <p>
            Processing your Personal Information depends on how you interact
            with the Website and Services, where you are located in the world
            and if one of the following applies: (i) you have given your consent
            for one or more specific purposes; (ii) provision of information is
            necessary for the performance of an agreement with you and/or for
            any pre-contractual obligations thereof; (iii) processing is
            necessary for compliance with a legal obligation to which you are
            subject; (iv) processing is related to a task that is carried out in
            the public interest or in the exercise of official authority vested
            in us; (v) processing is necessary for the purposes of the
            legitimate interests pursued by us or by a third party.
          </p>
        </section>

        {/* Section 4: Payment Processing */}
        <section id="payment-processing" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Payment processing</h2>
          <p className="mb-4">
            In case of Services requiring payment, you may need to provide your
            credit card details or other payment account information, which will
            be used solely for processing payments. We use third-party payment
            processors (“Payment Processors”) to assist us in processing your
            payment information securely.
          </p>
          <p className="mb-4">
            Payment Processors adhere to the latest security standards as
            managed by the PCI Security Standards Council, which is a joint
            effort of brands like Visa, MasterCard, American Express and
            Discover. Sensitive and private data exchange happens over a SSL
            secured communication channel and is encrypted and protected with
            digital signatures. The Website and Services are also in compliance
            with strict vulnerability standards to create a secure environment
            for Users. We will share payment data with the Payment Processors
            only to the extent necessary for the purposes of processing your
            payments, refunding such payments, and dealing with complaints and
            queries related to such payments and refunds.
          </p>
          <p>
            Please note that the Payment Processors may collect some Personal
            Information from you, which allows them to process your payments
            (e.g., your email address, address, credit card details, and bank
            account number) and handle all the steps in the payment process
            through their systems, including data collection and data
            processing. The Payment Processors’ use of your Personal Information
            is governed by their respective privacy policies which may or may
            not contain privacy protections as protective as this Policy. We
            suggest that you review their respective privacy policies.
          </p>
        </section>

        {/* Section 5: Managing Information */}
        <section id="managing-information" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Managing information
          </h2>
          <p className="mb-4">
            You are able to delete certain Personal Information we have about
            you. The Personal Information you can delete may change as the
            Website and Services change. When you delete Personal Information,
            however, we may maintain a copy of the unrevised Personal
            Information in our records for the duration necessary to comply with
            our obligations to our affiliates and partners, and for the purposes
            described below. If you would like to delete your Personal
            Information or permanently delete your account, you can do so on the
            settings page of your account on the Website.
          </p>
        </section>

        {/* Section 6: Disclosure of Information */}
        <section id="disclosure-of-information" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Disclosure of information
          </h2>
          <p className="mb-4">
            Depending on the requested Services or as necessary to complete any
            transaction or provide any Service you have requested, we may share
            your information with our affiliates, contracted companies, and
            service providers (collectively, “Service Providers”) we rely upon
            to assist in the operation of the Website and Services available to
            you and whose privacy policies are consistent with ours or who agree
            to abide by our policies with respect to Personal Information. We
            will not share any personally identifiable information with third
            parties and will not share any information with unaffiliated third
            parties.
          </p>
          <p>
            Service Providers are not authorized to use or disclose your
            information except as necessary to perform services on our behalf or
            comply with legal requirements. Service Providers are given the
            information they need only in order to perform their designated
            functions, and we do not authorize them to use or disclose any of
            the provided information for their own marketing or other purposes.
          </p>
        </section>

        {/* Section 7: Retention of Information */}
        <section id="retention-of-information" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Retention of information
          </h2>
          <p className="mb-4">
            We will retain and use your Personal Information for the period
            necessary as long as your user account remains active, to enforce
            our agreements, resolve disputes, and unless a longer retention
            period is required or permitted by law.
          </p>
          <p>
            We may use any aggregated data derived from or incorporating your
            Personal Information after you update or delete it, but not in a
            manner that would identify you personally. Once the retention period
            expires, Personal Information shall be deleted. Therefore, the right
            to access, the right to erasure, the right to rectification, and the
            right to data portability cannot be enforced after the expiration of
            the retention period.
          </p>
        </section>

        {/* Section 8: California Privacy Rights */}
        <section id="california-privacy-rights" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            8. California privacy rights
          </h2>
          <p className="mb-4">
            Consumers residing in California are afforded certain additional
            rights with respect to their Personal Information under the
            California Consumer Privacy Act (“CCPA”). If you are a California
            resident, this section applies to you.
          </p>
          <p className="mb-4">
            In addition to the rights as explained in this Policy, California
            residents who provide Personal Information as defined in the statute
            to obtain Services for personal, family, or household use are
            entitled to request and obtain from us, once a calendar year,
            information about the categories and specific pieces of Personal
            Information we have collected and disclosed.
          </p>
          <p>
            Furthermore, California residents have the right to request deletion
            of their Personal Information or opt-out of the sale of their
            Personal Information which may include selling, disclosing, or
            transferring Personal Information to another business or a third
            party for monetary or other valuable consideration. To do so, simply
            contact us. We will not discriminate against you if you exercise
            your rights under the CCPA.
          </p>
        </section>
        {/* Section 9: How to Exercise Your Rights */}
        <section id="how-to-exercise-your-rights" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            9. How to exercise your rights
          </h2>
          <p className="mb-4">
            Any requests to exercise your rights can be directed to us through
            the contact details provided in this document. Please note that we
            may ask you to verify your identity before responding to such
            requests. Your request must provide sufficient information that
            allows us to verify that you are the person you are claiming to be
            or that you are the authorized representative of such person. If we
            receive your request from an authorized representative, we may
            request evidence that you have provided such an authorized
            representative with power of attorney or that the authorized
            representative otherwise has valid written authority to submit
            requests on your behalf.
          </p>
          <p>
            You must include sufficient details to allow us to properly
            understand the request and respond to it. We cannot respond to your
            request or provide you with Personal Information unless we first
            verify your identity or authority to make such a request and confirm
            that the Personal Information relates to you.
          </p>
        </section>

        {/* Section 10: Data Analytics */}
        <section id="data-analytics" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Data analytics</h2>
          <p className="mb-4">
            Our Website and Services may use third-party analytics tools that
            use cookies, web beacons, or other similar information-gathering
            technologies to collect standard internet activity and usage
            information. The information gathered is used to compile statistical
            reports on User activity such as how often Users visit our Website
            and Services, what pages they visit and for how long, etc. We use
            the information obtained from these analytics tools to monitor the
            performance and improve our Website and Services. We do not use
            third-party analytics tools to track or to collect any personally
            identifiable information of our Users and we will not associate any
            information gathered from the statistical reports with any
            individual User.
          </p>
        </section>

        {/* Section 11: Do Not Track Signals */}
        <section id="do-not-track-signals" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            11. Do Not Track signals
          </h2>
          <p className="mb-4">
            Some browsers incorporate a Do Not Track feature that signals to
            websites you visit that you do not want to have your online activity
            tracked. Tracking is not the same as using or collecting information
            in connection with a website. For these purposes, tracking refers to
            collecting personally identifiable information from consumers who
            use or visit a website or online service as they move across
            different websites over time. How browsers communicate the Do Not
            Track signal is not yet uniform. As a result, the Website and
            Services are not yet set up to interpret or respond to Do Not Track
            signals communicated by your browser. Even so, as described in more
            detail throughout this Policy, we limit our use and collection of
            your Personal Information.
          </p>
          <p>
            For a description of Do Not Track protocols for browsers and mobile
            devices or to learn more about the choices available to you, visit{" "}
            <a
              href="https://www.internetcookies.com"
              target="_blank"
              className="text-blue-600 underline"
            >
              internetcookies.com
            </a>
            .
          </p>
        </section>

        {/* Section 12: Advertisements */}
        <section id="advertisements" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Advertisements</h2>
          <p>
            We may permit certain third-party companies to help us tailor
            advertising that we think may be of interest to Users and to collect
            and use other data about User activities on the Website. These
            companies may deliver ads that might place cookies and otherwise
            track User behavior.
          </p>
        </section>

        {/* Section 13: Links to Other Resources */}
        <section id="links-to-other-resources" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            13. Links to other resources
          </h2>
          <p>
            The Website and Services contain links to other resources that are
            not owned or controlled by us. Please be aware that we are not
            responsible for the privacy practices of such other resources or
            third parties. We encourage you to be aware when you leave the
            Website and Services and to read the privacy statements of each and
            every resource that may collect Personal Information.
          </p>
        </section>

        {/* Section 14: Information Security */}
        <section id="information-security" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            14. Information security
          </h2>
          <p className="mb-4">
            We secure information you provide on computer servers in a
            controlled, secure environment, protected from unauthorized access,
            use, or disclosure. We maintain reasonable administrative,
            technical, and physical safeguards in an effort to protect against
            unauthorized access, use, modification, and disclosure of Personal
            Information in our control and custody. However, no data
            transmission over the Internet or wireless network can be
            guaranteed.
          </p>
          <p>
            Therefore, while we strive to protect your Personal Information, you
            acknowledge that (i) there are security and privacy limitations of
            the Internet which are beyond our control; (ii) the security,
            integrity, and privacy of any and all information and data exchanged
            between you and the Website and Services cannot be guaranteed; and
            (iii) any such information and data may be viewed or tampered with
            in transit by a third party, despite best efforts.
          </p>
        </section>

        {/* Section 15: Data Breach */}
        <section id="data-breach" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Data breach</h2>
          <p className="mb-4">
            In the event we become aware that the security of the Website and
            Services has been compromised or Users’ Personal Information has
            been disclosed to unrelated third parties as a result of external
            activity, including, but not limited to, security attacks or fraud,
            we reserve the right to take reasonably appropriate measures,
            including, but not limited to, investigation and reporting, as well
            as notification to and cooperation with law enforcement authorities.
            In the event of a data breach, we will make reasonable efforts to
            notify affected individuals if we believe that there is a reasonable
            risk of harm to the User as a result of the breach or if notice is
            otherwise required by law. When we do, we will post a notice on the
            Website and send you an email.
          </p>
        </section>

        {/* Section 16: Changes and Amendments */}
        <section id="changes-and-amendments" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            16. Changes and amendments
          </h2>
          <p>
            We reserve the right to modify this Policy or its terms related to
            the Website and Services at any time at our discretion. When we do,
            we will send you an email to notify you. We may also provide notice
            to you in other ways at our discretion, such as through the contact
            information you have provided.
          </p>
        </section>

        {/* Section 17: Acceptance of this Policy */}
        <section id="acceptance-of-this-policy" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            17. Acceptance of this policy
          </h2>
          <p>
            You acknowledge that you have read this Policy and agree to all its
            terms and conditions. By accessing and using the Website and
            Services and submitting your information you agree to be bound by
            this Policy. If you do not agree to abide by the terms of this
            Policy, you are not authorized to access or use the Website and
            Services.
          </p>
        </section>

        {/* Section 18: Contacting Us */}
        <section id="contacting-us" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">18. Contacting us</h2>
          <p className="mb-4">
            If you have any questions regarding the information we may hold
            about you or if you wish to exercise your rights, you may use the
            following data subject request form to submit your request:
          </p>
          <p className="mb-4">
            <a
              href="https://app.websitepolicies.com/dsar/view/6n2fis5g"
              target="_blank"
              className="text-blue-600 underline"
            >
              Submit a data access request
            </a>
          </p>
          <p>
            If you have any other questions, concerns, or complaints regarding
            this Policy, we encourage you to contact us using the details below:
          </p>
          <p>
            <a
              href="mailto:feedback@kinscare.org"
              className="text-blue-600 underline"
            >
              feedback@kinscare.org
            </a>
          </p>
          <p className="mt-4">
            This document was last updated on September 3, 2022.
          </p>
        </section>
      </div>
      
    </>
  );
};

export default PrivacyPolicy;
