import Image from "next/image";
import NavBar from "@/WebPages/Navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeroPic from "../Landing Page Image.png";
import Link from "next/link";
import Footer from "../../WebPages/Footer";

export const metadata = {
  title: "Kinscare - Connecting Caregivers with Providers Seamlessly",
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
    title: "Kinscare - Connecting Caregivers with Providers Seamlessly",
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
    title: "Kinscare - Connecting Caregivers with Providers Seamlessly",
    description:
      "Kinscare helps providers find qualified caregivers and caregivers find best-fitting jobs. Our aim is to deliver value to our users with a growing registry.",
    images: ["https://kinscare-storage.s3.us-east-1.amazonaws.com/Kinscare+Logo.png"],
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
            <h1 className="font-title max-w-2xl mb-6 text-4xl text-gray-950  antialiased font-extrabold leading-none md:text-5xl xl:text-7xl dark:text-white">
              Connecting Caregivers with Providers Seamlessly
            </h1>
            <p className="text-md text-gray-600 mb-4  antialiased lg:mb-8 md:text-md lg:text-md dark:text-gray-400">
              Kinscare is an online registry that aims to help providers find
              qualified caregivers and caregivers to find best fitting jobs. Our
              aim is to grow our registry everyday and deliver value to our
              users
            </p>
            <div className="mb-5">
              <Button className="p-6 w-full lg:w-[inherit]">
                <Link href="/signup">Find Your Match</Link>
              </Button>
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
            <h2 className="text-3xl  max-w-3xl mx-auto font-title font-bold text-gray-800 text-center dark:text-white md:text-4xl xl:text-5xl">
              Empowering <span>care</span>, simplifying connections
            </h2>
            <p className="mx-auto mt-6 antialiased text-slate-600 dark:text-gray-300 max-w-md text-center">
              #1 best platform for providers to find qualified caregivers.
            </p>
          </div>
          <div className="relative">
            <div className="relative z-10 pt-10 py-1 gap-y-10 px-5 grid mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
              <div className="mr-auto place-self-center lg:py-16 lg:px-6 py-2 lg:col-span-6">
                <div className="m">
                  <div className="p-1">
                    <h3 className="mb-4 relative max-w-6xl mx-auto text-center !leading-snug text-2xl md:text-3xl text-gray-700 font-bold lg:text-left">
                      High-Quality caregivers near you
                    </h3>
                    <p className="text-md text-gray-700 antialiased">
                      At Kinscare, each caregiver provides their detailed
                      information and certifications, ensuring that you connect
                      with only the most qualified professionals. Our platform
                      is designed to boost caregivers who meet high standards,
                      giving you confidence in your hiring decisions.
                    </p>
                  </div>
                  <ul className="py-3 flex flex-col gap-4">
                    <li>
                      <p>
                        With our comprehensive profiles, you can easily review
                        qualifications, experience, and certifications, allowing
                        you to make informed choices quickly. Say goodbye to
                        endless searches and hello to finding the perfect match
                        for your needs.
                      </p>
                    </li>
                    <li>
                      <p>
                        We understand that your time is valuable. That's why we
                        use advanced algorithms to match you with caregivers who
                        meet your specific criteria, saving you time and effort
                        in the hiring process.
                      </p>
                    </li>
                    <li>
                      <p>
                        Kinscare's focus on quality means you get access to
                        top-tier caregivers, enhancing the care experience for
                        those you support.
                      </p>
                    </li>
                  </ul>
                  <div className="py-4">
                    <Button className="py-6 px-8 w-full lg:w-auto">
                      <Link href="/find-caregivers">
                        Find Quality Caregivers
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mr-auto place-self-center py-2 lg:col-span-6">
                <div className="m">
                  <img
                    className="w-full"
                    src="https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/caregiver%20final%20(1).png?alt=media&token=30bc0150-58b7-4f59-8b51-57968abe482c"
                    alt="feature1"
                  />
                </div>
              </div>
            </div>
            <div className="relative z-10 py-1 gap-y-10 px-5  grid mx-auto lg:gap-8 xl:gap-0 lg:grid-cols-12">
              <div className="mr-auto place-self-center py-2 lg:col-span-6">
                <div className="m">
                  <img
                    className="w-full"
                    src="https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/Provider%20Group%20(1).png?alt=media&token=aee75ff2-5344-49d4-986a-dd4f7125fc30"
                    alt="feature1"
                  />
                </div>
              </div>
              <div className="mr-auto place-self-center lg:py-16 lg:px-6 py-2 lg:col-span-6">
                <div className="m">
                  <div className="p-1">
                    <h3 className="mb-4 relative max-w-6xl mx-auto text-center !leading-snug text-2xl md:text-3xl text-gray-700 font-bold lg:text-left">
                      Get matched with providers
                    </h3>
                    <p className="text-md text-gray-700 antialiased">
                      <span></span> At Kinscare, we believe in empowering
                      caregivers by providing access to a variety of job
                      opportunities that align with your skills and preferences.
                      Whether you’re looking for looking for live-in, on call,
                      weekends, full/part time jobs or specialized roles, our
                      platform connects you with providers who value your
                      expertise and dedication.
                    </p>
                  </div>
                  <ul className="py-3 flex flex-col gap-4">
                    <li>
                      <p>
                        <span></span> Stand out to potential employers by
                        creating a comprehensive profile that highlights your
                        qualifications and certifications. By showcasing your
                        skills and experience, you increase your chances of
                        being selected for the best positions available
                      </p>
                    </li>
                    <li>
                      <p>
                        We’ve designed our platform to be intuitive and
                        user-friendly, making it easy for you to find and apply
                        for jobs. Our straightforward application process
                        ensures that you can quickly connect with providers
                        without unnecessary hassle.
                      </p>
                    </li>
                  </ul>
                  <div className="py-4">
                    <Button className="py-6 px-8  w-full lg:w-auto">
                      <Link href="/find-jobs">Find Quality Job</Link>
                    </Button>
                  </div>
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
                    Intuitive Navigation
                  </h4>
                  <p className="text-gray-200 text-sm ">
                    Effortlessly navigate kinscare with ease our design, making
                    it easy to find caregivers or manage your profile with just
                    a few clicks. Clear, step-by-step instructions ensure a
                    seamless experience for you. Our responsive design
                    guarantees a smooth, consistent experience across all
                    devices, from desktops to smartphones.
                  </p>
                  <Button variant="ghost"></Button>
                </div>
              </div>
              <div className="rounded-xl lg:m-4 transition duration-300 hover:scale-105  bg-gray-700  shadow-2xl shadow-gray-600/10 dark:-gray-700 dark:bg-gray-800 dark:shadow-none">
                <div className="p-6">
                  <h4 className="text-2xl font-title font-bold py-4 text-gray-200 antialiased">
                    All-in-One Dashboard
                  </h4>
                  <p className="text-gray-200 text-sm py-2 ">
                    Manage all your activities from a single, comprehensive
                    dashboard. From job postings and applications to
                    communication and profile updates, everything is centralized
                    for your convenience.
                  </p>
                  <p className="text-gray-200 text-sm  py-2">
                    Stay updated with real-time notifications and updates on job
                    applications, messages, and more. Our platform keeps you
                    informed, so you never miss a beat.
                  </p>
                  <Button variant="ghost"></Button>
                </div>
              </div>
              <div className="rounded-xl lg:m-4 transition duration-300 hover:scale-105  bg-gray-700  shadow-2xl shadow-gray-600/10 dark:-gray-700 dark:bg-gray-800 dark:shadow-none">
                <div className="p-6">
                  <h4 className="text-2xl font-title font-bold py-4 text-gray-200 antialiased">
                    Discover Fulfilling Careers in Nursing & Allied Healthcare
                  </h4>
                  <p className="text-gray-200 text-sm py-2 ">
                    Kinscare connects you to local colleges, universities, and
                    vocational programs that provide the education and training
                    needed to enter nursing and allied healthcare professions.
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
