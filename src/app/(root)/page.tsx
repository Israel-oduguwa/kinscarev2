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
      <NavBar />
      <section className="bg-orange-50 relative overflow-hidden ">
        <div className="grid max-w-screen-xl px-4 py-2 lg:py-10 xl:px-0 mt-[73px] mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
          <div className="mr-auto place-self-center lg:py-16 lg:px-6 py-2 lg:col-span-6">
            <h1 className=" max-w-2xl mb-6 text-3xl tracking-tight text-gray-800  antialiased font-extrabold  md:text-5xl xl:text-7xl dark:text-white">
              Seamlessly Matching Caregivers with Providers
            </h1>
            <p className="text-xl text-gray-800 mb-4 antialiased lg:mb-8 md:text-md lg:text-md dark:text-gray-400">
              Whether you're hiring, seeking caregiving opportunities, or
              exploring a future in healthcare—Kinscare is built for you.
            </p>
            <div className="mb-5">
              <button className="bg-indigo-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300">
                <Link href="/signup">Find Your Match</Link>
              </button>
            </div>
          </div>
          <div className="flex order-1 lg:mt-0 lg:col-span-6 lg:order-1">
            <Image
              src={HeroPic}
              className=" w-full lg:absolute  lg:w-[520px]  2xl:w-[840px] xl:w-[750px] xl:top-[73px]"
              alt="Picture of the hero section"
            />
          </div>
        </div>
      </section>
      <section className="bg-white relative py-20 md:py-30 overflow-hidden dark:bg-gray-900">
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
            <div className="relative z-10 pt-10 py-8 gap-y-10 px-5 grid mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:py-16 lg:px-6 py-2 lg:col-span-6">
                <div className="max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      {" "}
                      <p className="font-bold text-lg text-blue-600 "></p>
                      <h3 className="mb-4 relative text-3xl md:text-4xl !leading-tight text-gray-900 font-bold">
                        Hire the Right Caregiver with Confidence
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
                          <p className="  text-gray-900 mb-2">
                            View Caregiver Profiles & Contact Details
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
                            Reduce Turnover with Better-Matched Hires
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
                    src="https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/caregiver%20final%20(1).png?alt=media&token=30bc0150-58b7-4f59-8b51-57968abe482c"
                    alt="Caregiver connecting with senior"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/20 rounded-2xl" /> */}
                </div>
              </div>
            </div>
            <div className="relative z-10 py-8 gap-y-10 px-5  grid mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
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

            <div className="relative z-10 pt-10 py-8 gap-y-10 px-5 grid mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
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
      <section className="bg-gray-800 relative py-20 md:py-30 overflow-hidden dark:bg-gray-900">
        <div className="max-w-7xl mx-auto antialiased ">
          <div className="px-8">
            <h2 className="text-3xl text-gray-50  max-w-3xl mx-auto font-title font-bold text-center dark:text-white md:text-4xl xl:text-5xl">
              Experience a Seamless and Intuitive Interface
            </h2>
            <p className="mx-auto mt-6 antialiased text-gray-100 dark:text-gray-300 max-w-md text-center">
              Designed with you in mind, our platform offers a hassle-free
              experience for both caregivers and providers.
            </p>
          </div>
          <div className="relative">
            <div className="mt-16 grid gap-8 px-6 sm:mx-auto sm:w-2/3 md:w-full md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl lg:m-4 transition duration-300 hover:scale-105  bg-gray-700  shadow-2xl shadow-gray-600/10 dark:-gray-700 dark:bg-gray-800 dark:shadow-none">
                <div className="p-6">
                  <h4 className="text-2xl font-title font-bold py-4 text-gray-200 antialiased">
                    Easy to Use
                  </h4>
                  <p className="text-gray-200 text-sm ">
                    Kinscare makes it simple to find caregivers, apply for a
                    caregiving job, or explore local nursing and allied
                    healthcare programs. Clear, step-by-step guidance helps you
                    navigate the platform effortlessly, whether you're using a
                    computer or a phone.
                  </p>
                  <Button variant="ghost"></Button>
                </div>
              </div>
              <div className="rounded-xl lg:m-4 transition duration-300 hover:scale-105  bg-gray-700  shadow-2xl shadow-gray-600/10 dark:-gray-700 dark:bg-gray-800 dark:shadow-none">
                <div className="p-6">
                  <h4 className="text-2xl font-title font-bold py-4 text-gray-200 antialiased">
                    Everything in One Place
                  </h4>
                  <p className="text-gray-200 text-sm py-2 ">
                    For providers, easily post jobs, review applications, and
                    connect with caregivers—all from one dashboard. For
                    caregivers, quickly apply for jobs and explore nursing and
                    allied healthcare programs near you.
                  </p>
                  {/* <p className="text-gray-200 text-sm  py-2">
                    Stay updated with real-time notifications and updates on job
                    applications, messages, and more. Our platform keeps you
                    informed, so you never miss a beat.
                  </p> */}
                  <Button variant="ghost"></Button>
                </div>
              </div>
              <div className="rounded-xl lg:m-4 transition duration-300 hover:scale-105  bg-gray-700  shadow-2xl shadow-gray-600/10 dark:-gray-700 dark:bg-gray-800 dark:shadow-none">
                <div className="p-6">
                  <h4 className="text-2xl font-title font-bold py-4 text-gray-200 antialiased">
                    Explore Healthcare Careers
                  </h4>
                  <p className="text-gray-200 text-sm py-2 ">
                    Thinking about a career in nursing or allied healthcare?
                    Kinscare provides information on training programs to help
                    you get started. Plus, our community forums let you connect
                    with others, ask questions, and learn from those on a
                    similar path.
                  </p>

                  <Button variant="ghost"></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="max-w-7xl mx-auto antialiased "></div>
      </section>
      <Footer />
    </main>
  );
}
