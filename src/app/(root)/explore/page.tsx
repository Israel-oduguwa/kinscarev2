/* eslint-disable @next/next/no-img-element */
import GetStartedBtn from "@/WebPages/Explore/GetStartedBtn";
import Footer from "@/WebPages/Footer";
import NavBar from "@/WebPages/Navbar";
import TextAnimation from "@/WebPages/Explore/TextAnimation";
import { Metadata } from "next";
import Image from "next/image"; // ✅ Import Next.js Image
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Explore Nursing & Allied Healthcare Careers - KinsCare",
  description:
    "Discover fulfilling careers in nursing and allied healthcare. Join the KinsCare community, find local training institutions, and explore rewarding career opportunities.",
  openGraph: {
    title: "Explore Nursing & Allied Healthcare Careers - KinsCare",
    description:
      "Discover fulfilling careers in nursing and allied healthcare. Join the KinsCare community, find local training institutions, and explore rewarding career opportunities.",
    url: "https://www.kinscare.org/explore",
    images: [
      {
        url: "https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare+Explorer.png",
        alt: "KinsCare Careers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Nursing & Allied Healthcare Careers - KinsCare",
    description:
      "Discover fulfilling careers in nursing and allied healthcare. Join the KinsCare community, find local training institutions, and explore rewarding career opportunities.",
    images: [
      "https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare+Explorer.png",
    ],
  },
  alternates: {
    canonical: "https://www.kinscare.org/explore",
  },
};

function page() {
  const jsonLd = {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Explore Nursing & Allied Healthcare Careers",
      description:
        "Discover fulfilling careers in nursing and allied healthcare. Join the KinsCare community, find local training institutions, and explore rewarding career opportunities.",
      url: "https://www.kinscare.org/explore",
      mainEntity: [
        {
          "@type": "EducationalOccupationalProgram",
          name: "Nursing Training Institutions",
          description:
            "Find local colleges, universities, and vocational programs that provide the education and training needed to enter nursing and allied healthcare professions.",
          provider: {
            "@type": "EducationalOrganization",
            name: "KinsCare Training Institutions",
          },
        },
        {
          "@type": "Community",
          name: "KinsCare Community",
          description:
            "A vibrant community for aspiring and current healthcare professionals to exchange job opportunities, resources, and insights.",
        },
      ],
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.kinscare.org/explore?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    }),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="p-6 text-sm">Loading…</div>}>
        {/* Hero Section */}
        <section className="bg-linear-to-br mt-10 h-[90vh] overflow-y-hidden from-blue-50 via-white to-purple-400 text-gray-800 items-center py-20">
          <div className="px-6 lg:px-12 py-10 text-center">
            {/* Header Section */}
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Discover Fulfilling Careers in <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-yellow-800 to-pink-600">
                Nursing & Allied Healthcare
              </span>
            </h1>
            {/* Typing Effect Animation */}
            <TextAnimation />
            {/* Get Started Button */}
            <GetStartedBtn>
              <div className="mt-8 mb-6">
                <button className="bg-indigo-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300">
                  Get Started
                </button>
              </div>
            </GetStartedBtn>
            {/* Hero Image */}
            <div className="relative max-w-[1024px] mx-auto py-10 w-full h-[350px] md:h-[600px]">
              <Image
                src="https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare+Explorer.png"
                alt="dahsboard-feauture"
                fill
                className="object-contain mx-auto"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
            {/* Floating badges */}
          </div>
        </section>

        {/* Section 2: Training Institutions */}
        <section className="bg-gray-50 py-36">
          <div className="max-w-7xl mx-auto">
            <div className="w-full">
              <h2 className="text-4xl mb-4 max-w-xl mx-auto font-bold text-gray-900 tracking-tight text-center">
                Explore the world of nursing and allied healthcare
              </h2>
              <p className="max-w-4xl mx-auto text-gray-600 mb-6 text-center">
                Find industries filled with rewarding opportunities. From
                registered nurses to physical therapists, medical technicians,
                and beyond, these fields offer diverse career paths with high
                demand now and an even brighter future ahead.
              </p>
              <p className=" max-w-4xl mx-auto text-center text-gray-600 mb-6">
                Enjoy flexibility in your work settings, from hospitals and
                clinics to private homes and research facilities, while making a
                meaningful difference in the lives of others every day.
              </p>
            </div>
          </div>
          <div className="max-w-7xl pt-20 mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg h-[340px] md:h-[400px]">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-915206502-min%20(1).jpg?alt=media&token=fb876b23-e97e-4cd3-bb33-99979ce54e8a"
                  alt="Training Institutions"
                  fill
                  className="rounded-lg shadow-lg object-cover"
                  sizes="(max-width: 768px) 90vw, 420px"
                />
              </div>
            </div>
            <div className="w-full">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl tracking-tight font-bold mb-6">
                  Find Local Training Institutions to{" "}
                  <span className="text-indigo-600">Start Your Journey</span>
                </h2>
                <p className="text-gray-600 mb-6">
                  Kinscare connects you to local colleges, universities, and
                  vocational programs that provide the education and training
                  needed to enter nursing and allied healthcare professions.
                </p>
                <p className=" text-gray-600 mb-6">
                  Many institutions offer flexible schedules to accommodate
                  working students, financial aid options, and specialized
                  programs tailored to help you succeed in these thriving
                  fields.
                </p>
                <div className="mt-6">
                  <GetStartedBtn>
                    <button className="bg-indigo-600 text-white px-8 py-4 font-bold rounded-full shadow-lg hover:bg-indigo-500">
                      Find Training Near You
                    </button>
                  </GetStartedBtn>
                </div>
              </div>
            </div>
            {/* Content */}
          </div>
        </section>

        {/* Section 3: Community */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            {/* Content */}
            <div className="text-center lg:text-left order-last lg:order-first">
              <h2 className="text-4xl tracking-tight font-bold mb-6">
                Join the KinsCare{" "}
                <span className="text-indigo-600">Community</span> for Support
                and Growth
              </h2>
              <p className="text-gray-600 mb-6">
                Be part of a vibrant community of aspiring and current
                healthcare professionals. Our discussion forum is a space where
                you can connect with others already enrolled in training
                programs or working in the field.
              </p>
              <p className="text-gray-600 mb-6">
                Exchange job opportunities, discover valuable resources, and
                gain insights that will save you time and money while supporting
                your career growth.
              </p>
              <p className="text-gray-600 mb-6">
                Share your thoughts, get feedback, and take steps toward
                achieving your healthcare dreams with the support of like-minded
                individuals.
              </p>
              <div className="mt-6">
                <GetStartedBtn>
                  <button className="bg-indigo-600 text-white px-8 py-4 font-bold rounded-full shadow-lg hover:bg-indigo-500">
                    Join the Community
                  </button>
                </GetStartedBtn>
              </div>
            </div>
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg h-[340px] md:h-[400px]">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1792043615-min%20(1).jpg?alt=media&token=88e040f7-a86a-44ee-8108-bd3ffb5b3f06"
                  alt="Community"
                  fill
                  className="rounded-lg shadow-lg object-cover"
                  sizes="(max-width: 768px) 90vw, 420px"
                />
              </div>
            </div>
          </div>
        </section>
      </Suspense>
    </main>
  );
}

export default page;
