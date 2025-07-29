/* eslint-disable react/no-unescaped-entities */
import { Check, PhoneForwarded, Pin, Search, Star, User } from "lucide-react";
import Image from "next/image";
import SearchBar from "./SearchBar";
const FindLandingPage = async () => {
  return (
    <div>
      <div className="relative w-full h-[70vh] mt-5 overflow-hidden bg-top bg-cover">
        {/* Background Image */}
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1380983332-min.jpg?alt=media&token=5f9db9a8-fe08-40a3-bb3c-cda1feb17bed"
          alt="Caregiver background"
          layout="fill"
          objectFit="cover"
          objectPosition="top"
          priority
          className="pointer-events-none select-none"
          // Remove draggable ghost image effect on mobile
          draggable={false}
        />

        {/* Overlay (gradient + semi-transparent layer) */}
        <div className="absolute inset-0 top-[30vh] bg-black bg-opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
        </div>

        {/* Content */}
        <div
          id="search-top"
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 pt-20 lg:pt-0"
        >
          {/* Headline */}
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Find the{" "}
            <span className="bg-[conic-gradient(var(--tw-gradient-stops))] from-yellow-500 via-red-500 to-pink-500 text-transparent bg-clip-text">
              Perfect Caregiver
            </span>
          </h1>

          {/* Search Bar */}
          <div className="max-w-7xl">
            <SearchBar />
          </div>
          <p className="text-gray-100 font-bold text-xl max-w-2xl mb-8">
            Over{" "}
            <span className="text-white font-extrabold">30 caregivers</span>{" "}
            join Kinscare every day!
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-1 px-6 md:px-12">
        <div className="max-w-6xl pt-10 pb-20 mx-auto">
          <div className="p-6 bg-gradient-to-br from-indigo-800 to-blue-900 rounded-2xl relative overflow-hidden">
            {/* Decorative gradient bubbles */}
            <div className="absolute -top-4 -right-4 w-28 h-28 bg-purple-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl" />

            <div className="flex flex-col md:flex-row items-start gap-8 relative">
              {/* Icon Container */}
              <div className="min-w-[50px] h-12 flex items-center justify-center p-2 bg-gradient-to-br from-sky-400/20 to-purple-400/20 rounded-xl border border-white/10">
                {/* <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 4v16m-8-8h16m-8 4a4 4 0 01-4-4 4 4 0 014-4 4 4 0 014 4 4 4 0 01-4 4z" />
              </svg> */}
                <Pin size={20} strokeWidth={2.25} className="text-white" />
              </div>

              <div className="flex-1">
                <p className="text-gray-200 text-md ">
                  Kinscare is designed to be easy and affordable to use. Every
                  caregiver you find through Kinscare means{" "}
                  <span className="font-bold">
                    better support, less stress, and higher-quality
                  </span>{" "}
                  care for your residents
                </p>

                {/* CTA Button */}
                {/* <button className="mt-6 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <span className="bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                  Start Matching Now →
                </span>
              </button> */}
              </div>
            </div>
          </div>
        </div>
        {/* Value Proposition Section */}
        <div className="text-center max-w-screen-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">
            Find Caregivers{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
              Faster
            </span>
            &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
              Easier
            </span>
          </h2>

          <p className=" text-gray-600 mb-6 dark:text-gray-300">
            Finding reliable caregivers is one of the biggest challenges for
            providers. High turnover, last-minute staffing gaps, and increasing
            demand make it harder than ever to secure dependable care. Kinscare
            simplifies the process, connecting you directly with caregivers
            ready to work. Whether you need full-time, part-time, or on-call
            support, we make hiring quick and stress-free. Join the growing
            network of providers who trust Kinscare to find caregivers
            efficiently
          </p>
        </div>
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                {/* Floating 3D card effect */}
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1336058538-min.jpg?alt=media&token=35eabd18-0e89-470b-a4d5-b8269b91a38c"
                    alt="Caregivers"
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Floating decorative element */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-30 z-0"></div>
              </div>

              <div>
                <div className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 font-semibold  rounded-full mb-4">
                  <Pin size={16} className="mr-2" />
                  <span>Why Use KinsCare ?</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Quick Matching",
                      description: "Search caregivers who meet your needs.",
                      icon: <Search size={20} className="text-cyan-500" />,
                    },
                    {
                      title: "Direct Contact",
                      description: "Connect instantly after signing up.",
                      icon: (
                        <PhoneForwarded size={20} className="text-purple-500" />
                      ),
                    },
                    {
                      title: "No Middleman:",
                      description:
                        "You recruit and hire directly—no agency fees.",
                      icon: <User size={20} className="text-amber-500" />,
                    },
                    {
                      title: "Flexible Hiring:",
                      description:
                        "Full-time, part-time, live-in, or on-call caregivers.",
                      icon: <Check size={20} className="text-emerald-500" />,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm mr-4">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl py-10 mx-auto grid md:grid-cols-1 gap-12 ">
          {/* Left Column */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <div>
              <h4 className="tracking-tight text-3xl font-bold text-gray-800 mb-6 ">
                Why Finding the Right Caregiver Matters
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 shrink-0 text-blue-600 flex items-center justify-center rounded-full mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 ">
                    <span className="font-semibold ">
                      {" "}
                      The Hiring Challenge:{" "}
                    </span>{" "}
                    Struggling to find reliable caregivers? High turnover rates
                    make it even harder to maintain consistent care.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 shrink-0 text-blue-600 flex items-center justify-center rounded-full mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 ">
                    <span className="font-semibold ">The Consequences: </span>{" "}
                    When shifts go unfilled, resident care suffers, staff
                    burnout increases, and compliance risks grow. In many cases,
                    providers are forced to step in themselves—losing valuable
                    time for rest, business operations, or high-value
                    activities.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 shrink-0 text-blue-600 flex items-center justify-center rounded-full mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 ">
                    <span className="font-semibold ">
                      Transition to the solution:{" "}
                    </span>{" "}
                    That’s where KinsCare makes a difference
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl py-10 mx-auto grid md:grid-cols-2  gap-12 ">
          {/* Left Column */}
          <div>
            <div>
              <h4 className="tracking-tight text-3xl font-bold text-gray-800 mb-6 ">
                Get More Caregivers by Posting Your Job
              </h4>
              <p>
                Posting a job on Kinscare makes it even easier to find
                caregivers. Once your job is live, caregivers can apply even
                after you’ve logged off, share it with their colleagues, and
                help spread the word. Plus, we email your job to caregivers in
                our network, increasing your chances of finding the right
                match—fast. <br /> <br /> Kinscare keeps hiring simple,
                affordable, and effective so you can focus on providing the best
                care for your residents
              </p>
            </div>
          </div>
          {/* Right Column */}
          <div className="relative">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1140153601-min.jpg?alt=media&token=93fce255-b7d8-4e0d-a28a-5e089a94d6e7"
              alt="Caregivers"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Care Professionals
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto dark:text-gray-400">
              Join hundreds of healthcare professionals who've transformed their
              hiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Shevchenko",
                role: "Care Home Manager",
                content:
                  "Kinscare makes finding caregivers easier than ever! I can post openings, get direct applications, and contact caregivers—no more waiting on referrals.",
                initials: "MS",
                color: "from-purple-500 to-indigo-500",
              },
              {
                name: "Solomon Gebremariam",
                role: "Healthcare Recruiter",
                content:
                  "I found qualified local caregivers quickly with Kinscare. It’s simple, effective, and saves me time compared to other hiring methods!",
                initials: "SG",
                color: "from-cyan-500 to-blue-500",
              },
              {
                name: "Alice Kamau",
                role: "Adult Family Home Owner",
                content:
                  "Kinscare is both affordable and flexible. I only pay when I need caregivers, and get direct access to candidates without extra hassle.",
                initials: "AK",
                color: "from-amber-500 to-orange-500",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-r ${testimonial.color} flex items-center justify-center text-white font-bold text-lg mr-4`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      fill="#fbbf24"
                      className="text-amber-400 mr-1"
                    />
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>

          <div className="max-w-7xl my-8 mx-auto ">
            <div className="relative bg-gradient-to-br from-indigo-900 to-blue-800 rounded-2xl p-6 md:p-10 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="mb-4">
                <div className="inline-flex items-center gap-3 mb-1">
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-white">
                    Trusted by Providers Like You
                  </h3>
                </div>
                <p className="text-indigo-100 leading-relaxed">
                  Join the growing community of healthcare professionals who
                  trust Kinscare
                </p>
              </div>
              <div className="flex flex-row md:flex-row items-center gap-8 relative z-10">
                {/* Left Section */}

                {/* Right Section */}
                <div className=" text-center md:text-left">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-sky-500/20 blur-lg" />
                      <span className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent relative">
                        200+
                      </span>
                    </div>
                    <svg
                      className="w-8 h-8 text-rose-400 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <p className="text-indigo-100 font-medium">
                    Over 200 Providers in the Northwest use Kinscare and the
                    number keeps
                    <span className="text-emerald-300">
                      {" "}
                      {""} growing daily!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-100 py-10 px-6 md:px-12">
        <div className="py-10">
          <h2 className="text-3xl md:text-4xl text-center font-bold tracking-tight text-gray-800 mb-3">
            What is the best way to find caregivers?
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Follow these simple steps to find the most qualified caregivers for
            your needs.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-start">
          {/* Step 1 */}
          <div className="bg-white rounded-lg  min-h-80 p-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-upload"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold tracking-tight  text-gray-800 mb-2">
              Post Your Job
            </h3>
            <p className="text-gray-700 antialiased">
              Create a detailed job listing. When you post your job opening,
              local caregivers looking for work receive email and text alerts
              about your opening
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-white rounded-lg  min-h-80 p-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-search"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Search for Caregivers
            </h3>
            <p className="text-gray-700 antialiased">
              Search for caregivers by their availability e.g., “Full time”,
              “Part time” and their licenses, e.g., “CNA/NAC”, “HCA”. When you
              search, we find the best caregiver that meets your search criteria
              and show you their resume/cv that contains their contact
              information
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-white rounded-lg min-h-80 p-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 text-purple-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-phone-forwarded"
              >
                <polyline points="18 2 22 6 18 10" />
                <line x1="14" x2="22" y1="6" y2="6" />
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Contact & Hire
            </h3>
            <p className="text-gray-700 antialiased">
              Review resumes and connect with caregivers directly to finalize
              your hiring process. Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Culpa officiis corrupti, eum id autem ad earum
              ipsum quisquam rerum aut!
            </p>
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-12 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl">
            {/* Floating elements */}
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-gradient-to-r from-pink-400/20 to-rose-500/20 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Find Your Perfect Caregiver?
              </h2>

              <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
                Join thousands of providers who trust Kinscare to find reliable,
                qualified caregivers quickly and easily.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Search Caregivers Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindLandingPage;
