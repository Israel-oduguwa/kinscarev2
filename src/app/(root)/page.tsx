/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import NavBar from "@/WebPages/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeroPic from "../Landing Page Image.png";
import Link from "next/link";
import Footer from "../../WebPages/Footer";

export const metadata = {
  title: "Kinscare -Seamlessly Matching Caregivers with Providers",
  description:
    "Kinscare helps providers find qualified caregivers and caregivers find best-fitting jobs. Our aim is to deliver value to our users with a growing registry.",
  keywords: [
    "caregivers",
    "providers",
    "Kinscare",
    "Jobs",
    "Registry",
    "job",
    "health",
    "Care Platform",
    "kinscare",
  ],
  openGraph: {
    title: "Kinscare -Seamlessly Matching Caregivers with Providers",
    description:
      "Kinscare helps providers find qualified caregivers and caregivers find best-fitting jobs. Our aim is to deliver value to our users with a growing registry.",
    url: "https://www.kinscare.com",
    siteName: "Kinscare",
    images: [
      {
        url: "https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare+Logo.png",
        width: 1200,
        height: 630,
        alt: "Kinscare Hero Image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinscare -Seamlessly Matching Caregivers with Providers",
    description:
      "Kinscare helps providers find qualified caregivers and caregivers find best-fitting jobs. Our aim is to deliver value to our users with a growing registry.",
    images: [
      "https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare+Logo.png",
    ],
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Kinscare",
            url: "https://www.kinscare.com",
            logo: "https://www.kinscare.com/logo.png",
            description:
              "Kinscare helps providers find qualified caregivers and caregivers find best-fitting jobs. Our aim is to deliver value to our users with a growing registry.",
            sameAs: [
              "https://www.facebook.com/kinscare",
              "https://www.twitter.com/kinscare",
              "https://www.linkedin.com/company/kinscare",
            ],
          }),
        }}
      />

      <header className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-indigo-200/30 to-rose-200/30 -top-32 -left-32 animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-amber-200/30 to-emerald-200/30 top-1/4 right-20 animate-[float_7s_ease-in-out_infinite_1s]"></div>
        <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-rose-200/30 to-indigo-200/30 bottom-20 left-1/4 animate-[float_6s_ease-in-out_infinite_2s]"></div>
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-emerald-200/30 to-amber-200/30 bottom-32 right-1/3 animate-[float_5s_ease-in-out_infinite_3s]"></div>

        <div className="max-w-screen-xl mx-auto px-4 lg:px-4 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text content */}
            <div className="relative pt-20 md:pt-40  z-10">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold antialiased tracking-tight text-slate-800 mb-6">
                Helping Providers Find the Right Caregivers with Ease
              </h1>

              <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-xl">
                Whether you're hiring, seeking caregiving opportunities, or
                exploring a future in healthcare—Kinscare is built for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="/find-caregivers"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-violet-800 hover:-translate-y-1"
                >
                  Find Your Match
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                <Link
                  href="/post-job"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-indigo-600 bg-white rounded-full shadow hover:shadow-md transition-all duration-300 border border-indigo-100 hover:border-indigo-200"
                >
                  Post a job
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center">
                  <div className="text-lg font-bold text-indigo-600">200+</div>
                  <div className="ml-3 text-sm text-slate-600">
                    Providers in the Northwest
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-lg font-bold text-indigo-600">98%</div>
                  <div className="ml-3 text-sm text-slate-600">
                    Satisfaction Rate
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-lg font-bold text-indigo-600">24/7</div>
                  <div className="ml-3 text-sm text-slate-600">Support</div>
                </div>
              </div>
            </div>
            {/* Image section with floating cards */}
            <div>
              <Image
                src={HeroPic}
                className=" w-full z-10 xl:top-20 lg:w-[520px] 2xl:w-[840px] xl:w-[750px] lg:absolute"
                alt="Picture of the hero section"
              />
              <div className="">
                <div className=" aspect-square hidden lg:block w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 to-rose-100 border-8 border-white">
                  {/* Mock profile cards */}
                  {/* <div className="absolute top-10 left-10 bg-white p-5 rounded-2xl shadow-lg max-w-xs transform rotate-3 animate-[float_6s_ease-in-out_infinite_1s]">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div className="ml-4">
                        <h3 className="font-bold text-slate-800">
                          Sarah Johnson
                        </h3>
                        <p className="text-slate-600">Senior Caregiver</p>
                        <div className="mt-2 flex gap-1">
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            Elder Care
                          </span>
                          <span className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded-full">
                            5+ Years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <div className="absolute bottom-28 z-20 right-10 bg-white p-3.5 rounded-2xl shadow-xl shadow-slate-200 max-w-xs transform -rotate-2 animate-[float_5s_ease-in-out_infinite_2s]">
                    <div className="flex items-center">
                      {/* <div className="bg-rose-100 border-2 border-dashed rounded-xl w-10 h-10" /> */}
                      <div className="ml-4">
                        <h3 className="font-bold text-sm text-slate-800">
                          Michael Chen
                        </h3>
                        <p className="text-slate-600 text-xs">
                          Pediatric Specialist
                        </p>
                        <div className="mt-2 flex gap-1">
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full">
                            Child Care
                          </span>
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                            RN Certified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-2xl shadow-xl max-w-xs z-10 animate-[float_7s_ease-in-out_infinite]">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 border-2 border-dashed rounded-full w-10 h-10 mb-2" />
                      <h3 className="font-bold text-sm text-slate-800">
                        Elena Rodriguez
                      </h3>
                      <p className="text-slate-600 text-xs">
                        Elder Care Expert
                      </p>
                      <div className="mt-4 w-12 h-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full"></div>
                      <div className="mt-4 flex justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                {/* <div className="absolute -bottom-6 left-0 bg-white rounded-full py-2 px-4 shadow-lg flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium text-slate-800">
                    24/7 Support Available
                  </span>
                </div> */}

                {/* <div className="absolute -top-6 right-10 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-full py-2 px-4 shadow-lg">
                  <span className="font-bold">Trusted by 200+ Providers</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </header>
      <section className="bg-white relative py-20  overflow-hidden dark:bg-gray-900">
        <div className="max-w-7xl mx-auto antialiased ">
          <div className="px-8">
            <h2 className="text-3xl  max-w-3xl mx-auto tracking-tight font-bold text-gray-800 text-center dark:text-white md:text-4xl xl:text-5xl">
              Empowering <span>care</span>, simplifying connections
            </h2>
            <p className="mx-auto mt-6 antialiased text-slate-600 dark:text-gray-300 max-w-md text-center">
              #1 best platform for providers to find qualified caregivers.
            </p>
          </div>
          <div className="relative">
            <div className="relative z-10 pt-6 py-6 gap-y-10 px-5 grid mx-auto lg:gap-8 xl:gap-10 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:py-16 lg:px-6 py-2 lg:col-span-6">
                <div className="max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      {" "}
                      <p className="font-bold text-lg text-blue-600 "></p>
                      <h3 className="mb-4 relative text-3xl md:text-4xl !leading-tight text-gray-900 font-bold">
                        Hire the Right Caregiver—Fast & Hassle-Free
                      </h3>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Finding reliable caregivers shouldn't be difficult.
                      Kinscare connects you with{" "}
                      <span className="font-bold text-gray-800 ">
                        qualified local caregivers and CNAs
                      </span>{" "}
                      ready to work in adult family homes,{" "}
                      <span className="font-bold text-gray-800">
                        assisted living and nursing home, home care, and beyond
                      </span>
                      .
                    </p>
                  </div>

                  <div className="mt-4 space-y-0">
                    {/* Benefit 1 */}
                    <div className="group relative  py-3 rounded-xl transition-all hover:bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-900 mb-2">
                            See caregiver profiles, credentials, and real
                            contact details—all in one place.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Benefit 2 */}
                    <div className="group relative py-3 rounded-xl transition-all hover:bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="  text-gray-900 mb-2">
                            Cut turnover with better-matched hires, recommended
                            just for your needs.
                          </h4>
                          {/* <p className="text-gray-600 text-sm leading-relaxed">
                            Our smart matching system connects you with
                            caregivers who align with your organization's
                            culture and care philosophy, helping reduce
                            recruitment costs and staffing gaps.
                          </p> */}
                        </div>
                      </div>
                    </div>

                    {/* Benefit 3 */}
                    <div className="group relative py-3 rounded-xl transition-all hover:bg-gray-50/50">
                      <div className="flex   items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-purple-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow items-center">
                          <h4 className="  text-gray-900 mb-2">
                            Join Discussions & Connect Directly
                          </h4>
                          {/* <p className="text-gray-600  text-sm leading-relaxed">
                            Engage with healthcare professionals to discuss
                            hiring trends, training programs, and best
                            practices. Post jobs and interact with active
                            caregivers seeking positions.
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button className="bg-indigo-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300">
                      <Link href="/find-caregivers">
                        Start Matching With Caregivers →
                      </Link>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mr-auto place-self-center py-2 lg:col-span-6">
                <div className="relative">
                  <img
                    className="w-full rounded-2xl"
                    src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/KinsCare%20Images%2Ffeautures%201.jpg?alt=media&token=9a68d913-e0f3-4752-8025-884b0239ae3a"
                    alt="Caregiver connecting with senior"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/20 rounded-2xl" /> */}
                </div>
              </div>
            </div>
            <div className="relative z-10 py-6 gap-y-10 px-5  grid mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
              <div className="mr-auto place-self-center py-2 lg:col-span-6">
                <div className="m">
                  <img
                    className="w-full rounded-xl"
                    src="https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/Provider%20Group%20(1).png?alt=media&token=aee75ff2-5344-49d4-986a-dd4f7125fc30"
                    alt="feature1"
                  />
                </div>
              </div>
              <div className="mr-auto place-self-center lg:py-12 lg:px-6 py-2 lg:col-span-6">
                <div className="space-y-4">
                  <div>
                    {" "}
                    <p className="font-bold text-lg text-blue-600 "></p>
                    <h3 className="mb-4 relative text-3xl md:text-4xl !leading-tight text-gray-900 font-bold">
                      Find Jobs That Match Your Skills & Availability
                    </h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Looking for a{" "}
                    <span className="font-bold text-gray-900">
                      full-time, part-time, live-in, or on-call
                    </span>
                    caregiving job? KinsCare helps you{" "}
                    <span className="font-bold text-gray-900">
                      connect directly with employers
                    </span>{" "}
                    so you can choose the best opportunity for you.
                  </p>
                </div>
                <div className="mt-4 space-y-0">
                  {/* Benefit 1 */}
                  <div className="group relative  py-3 rounded-xl transition-all hover:bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="  text-gray-900 mb-2">
                          Apply for jobs in minutes
                        </p>
                        {/* <p className="text-gray-600 text-sm leading-relaxed">
                            Browse our verified registry of caregivers, CNAs,
                            and home care aides with detailed skills,
                            experience, and availability. Filter by location,
                            certifications, and preferences.
                          </p> */}
                      </div>
                    </div>
                  </div>

                  {/* Benefit 2 */}
                  <div className="group relative py-3 rounded-xl transition-all hover:bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="  text-gray-900 mb-2">
                          Get discovered by local employers
                        </h4>
                        {/* <p className="text-gray-600 text-sm leading-relaxed">
                            Our smart matching system connects you with
                            caregivers who align with your organization's
                            culture and care philosophy, helping reduce
                            recruitment costs and staffing gaps.
                          </p> */}
                      </div>
                    </div>
                  </div>

                  {/* Benefit 3 */}
                  <div className="group relative py-3 rounded-xl transition-all hover:bg-gray-50/50">
                    <div className="flex   items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-grow items-center">
                        <h4 className="  text-gray-900 mb-2">
                          Advance your career with healthcare training
                          opportunities
                        </h4>
                        {/* <p className="text-gray-600  text-sm leading-relaxed">
                            Engage with healthcare professionals to discuss
                            hiring trends, training programs, and best
                            practices. Post jobs and interact with active
                            caregivers seeking positions.
                          </p> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button className="bg-indigo-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300">
                    <Link href="/find-caregivers">
                      Find Jobs That Match Your Skill Now
                    </Link>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 py-6 gap-y-10 px-5 grid mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:py-16 lg:px-6 py-2 lg:col-span-6">
                <div className="max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      {" "}
                      <p className="font-bold text-lg text-blue-600 "></p>
                      <h3 className="mb-4 relative text-3xl md:text-4xl !leading-tight text-gray-900 font-bold">
                        Your First Step Toward a Career in Nursing or Allied
                        Healthcare
                      </h3>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Thinking about becoming an{" "}
                      <span className=" text-gray-900 font-bold">
                        LPN, RN, or allied healthcare professional
                      </span>
                      ? Many programs require direct patient care experience—and
                      caregiving can be your{" "}
                      <span className=" text-gray-900 font-bold">
                        stepping stone into the field
                      </span>
                      .
                    </p>
                  </div>

                  <div className="mt-4 space-y-0">
                    {/* Benefit 1 */}
                    <div className="group relative  py-3 rounded-xl transition-all hover:bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="  text-gray-900 mb-2">
                            Learn about nursing & allied healthcare programs
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Benefit 2 */}
                    <div className="group relative py-3 rounded-xl transition-all hover:bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="  text-gray-900 mb-2">
                            Find local employers who offer training & tuition
                            support
                          </h4>
                          {/* <p className="text-gray-600 text-sm leading-relaxed">
                            Our smart matching system connects you with
                            caregivers who align with your organization's
                            culture and care philosophy, helping reduce
                            recruitment costs and staffing gaps.
                          </p> */}
                        </div>
                      </div>
                    </div>

                    {/* Benefit 3 */}
                    <div className="group relative py-3 rounded-xl transition-all hover:bg-gray-50/50">
                      <div className="flex   items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-purple-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow items-center">
                          <h4 className="  text-gray-900 mb-2">
                            Connect with professionals & get career guidance
                          </h4>
                          {/* <p className="text-gray-600  text-sm leading-relaxed">
                            Engage with healthcare professionals to discuss
                            hiring trends, training programs, and best
                            practices. Post jobs and interact with active
                            caregivers seeking positions.
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button className="bg-indigo-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300">
                      <Link href="/find-caregivers">
                        Start exploring your future in healthcare →
                      </Link>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mr-auto place-self-center py-2 lg:col-span-6">
                <div className="relative">
                  <img
                    className="w-full rounded-lg"
                    src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1792043615-min%20(1).jpg?alt=media&token=88e040f7-a86a-44ee-8108-bd3ffb5b3f06"
                    alt="Caregiver connecting with senior"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/20 rounded-2xl" /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-50 relative py-20  overflow-hidden dark:bg-gray-900">
        <div className="max-w-7xl mx-auto antialiased px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl tracking-tight font-bold text-gray-900 dark:text-white md:text-4xl xl:text-5xl">
              Trusted by Care Professionals
            </h2>
            <p className="mx-auto mt-4 text-gray-600 dark:text-gray-300 max-w-xl text-lg">
              Join hundreds of healthcare professionals who've transformed their
              hiring and job search
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-semibold text-lg">
                      MS
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Maria Shevchenko
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Care Home Manager
                  </p>
                </div>
              </div>
              <div className="text-blue-600 text-3xl mb-4"></div>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                Kinscare makes finding caregivers easier than WhatsApp! I can
                post openings, get direct applications, and contact
                caregivers—no more waiting on referrals.
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-300 font-semibold text-lg">
                      SG
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Solomon Gebremariam
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Healthcare Recruiter
                  </p>
                </div>
              </div>
              <div className="text-blue-600 text-3xl mb-4"></div>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                I found qualified local caregivers quickly with Kinscare. It’s
                simple, effective, and saves me time compared to other hiring
                methods!
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-300 font-semibold text-lg">
                      AK
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Alice Kamau
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Adult Family Home Owner
                  </p>
                </div>
              </div>
              <div className="text-blue-600 text-3xl mb-4"></div>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                Kinscare is both affordable and flexible. I only pay when I need
                caregivers, and get direct access to candidates without extra
                hassle.
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-20 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-6 font-medium">
              Trusted by 200+ healthcare organizations worldwide
            </p>
          </div>
        </div>
      </section>
      <section className="relative py-24 md:py-30 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-900 dark:to-gray-950">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-10 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 -right-10 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
            <div className="bg-grid-white/[0.05] absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-slate-100">
              Experience a Seamless and Intuitive Interface
            </h2>
            <p className="mt-6 text-lg text-gray-300 dark:text-gray-300 max-w-2xl mx-auto">
              Designed with you in mind, our platform offers a hassle-free
              experience for both caregivers and providers.
            </p>
          </div>

          <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Easy to Use */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 h-full transition-all duration-300 group-hover:border-blue-500/30 group-hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
                <div className="flex items-center mb-5">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white ml-4">
                    Easy to Use
                  </h3>
                </div>
                <p className="text-gray-300 ">
                  Kinscare makes it simple to find caregivers, apply for a
                  caregiving job, or explore local nursing and allied healthcare
                  programs. Clear, step-by-step guidance helps you navigate the
                  platform effortlessly, whether you're using a computer or a
                  phone.
                </p>
              </div>
            </div>

            {/* Card 2: Everything in One Place */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 h-full transition-all duration-300 group-hover:border-blue-500/30 group-hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
                <div className="flex items-center mb-5">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white ml-4">
                    Everything in One Place
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  For providers, easily post jobs, review applications, and
                  connect with caregivers—all from one dashboard. For
                  caregivers, quickly apply for jobs and explore nursing and
                  allied healthcare programs near you.
                </p>
              </div>
            </div>

            {/* Card 3: Explore Healthcare Careers */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 h-full transition-all duration-300 group-hover:border-teal-500/30 group-hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
                <div className="flex items-center mb-5">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white ml-4">
                    Explore Healthcare Careers
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Thinking about a career in nursing or allied healthcare?
                  Kinscare provides information on training programs to help you
                  get started. Plus, our community forums let you connect with
                  others, ask questions, and learn from those on a similar path.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="max-w-7xl mx-auto antialiased "></div>
      </section>
    </main>
  );
}

// <div className="flex flex-wrap justify-center gap-8 opacity-75">
// <div className="w-32 h-12 bg-gray-200 rounded-lg dark:bg-gray-700" />
// <div className="w-32 h-12 bg-gray-200 rounded-lg dark:bg-gray-700" />
// <div className="w-32 h-12 bg-gray-200 rounded-lg dark:bg-gray-700" />
// </div>
