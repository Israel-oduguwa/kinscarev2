/* eslint-disable @next/next/no-img-element */
import React from "react";
import SearchBar from "./SearchBar";
import { Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
const FindLandingPage = async () => {
  return (
    <div>
      <div
        className="relative w-full h-[70vh] mt-5 bg-cover bg-top"
        style={{
          backgroundImage:
            "url('https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1380983332-min.jpg?alt=media&token=5f9db9a8-fe08-40a3-bb3c-cda1feb17bed')",
        }}
      >
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 top-[30vh] bg-black bg-opacity-5">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
        </div>

        {/* Content */}
        <div id="search-top" className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 pt-20 lg:pt-0">
          {/* Headline */}
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Find the{" "}
            <span className="bg-[conic-gradient(var(--tw-gradient-stops))] from-yellow-500 via-red-500 to-pink-500 text-transparent bg-clip-text">
              Perfect Caregiver
            </span>{" "}
          </h1>

          {/* Search Bar */}

          <SearchBar />
          <p className="text-gray-100 font-bold text-xl max-w-2xl mb-8">
            Over{" "}
            <span className="text-white font-extrabold"> 30 caregivers </span>{" "}
            join Kinscare every day!
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-10 px-6 md:px-12">
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
        <div className="py-10">
          <h2 className="text-3xl md:text-4xl text-center font-bold tracking-tight text-gray-800 mb-3">
            {/* Why use <span className="text-blue-600">Kinscare?</span> */}{" "}
            Find Caregivers Faster & Easier
          </h2>
          <p className="text-gray-500 mx-auto max-w-6xl text-center mb-8">
            {/* Kinscare focuses on connecting you with experienced caregivers,
            saving you time and money. */}{" "}
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
        <div className="max-w-7xl pb-20 mx-auto grid md:grid-cols-2 gap-16 ">
          {/* Left Column */}

          {/* Right Column */}
          <div className="relative">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1336058538-min.jpg?alt=media&token=35eabd18-0e89-470b-a4d5-b8269b91a38c"
              alt="Caregivers"
              className="w-full h-auto rounded-xl"
            />
          </div>
          <div>
            <h4 className="tracking-tight text-3xl font-bold text-gray-800 mb-6 ">
              Why Use Kinscare
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 rounded-full mr-4">
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
                <p className="text-gray-700">
                  <span className="font-semibold ">Quick Matching: </span>Search
                  caregivers who meet your needs.
                </p>
              </li>
              <li className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 rounded-full mr-4">
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
                <p className="text-gray-700">
                  <span className="font-semibold "> Direct Contact: </span>
                  Connect instantly after signing up.
                </p>
              </li>
              <li className="flex items-center">
                <div className="w-10 h-10  bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mr-4 flex-shrink-0">
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
                  <span className="font-semibold ">No Middleman: </span> You
                  recruit and hire directly—no agency fees.
                </p>
              </li>
              <li className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 rounded-full mr-4">
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
                  {" "}
                  <span className="font-semibold ">Flexible Hiring:</span>{" "}
                  Full-time, part-time, live-in, or on-call caregivers.
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl py-10 mx-auto grid md:grid-cols-1 gap-12 ">
          {/* Left Column */}
          <div className="bg-blue-100 p-6 rounded-xl">
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
          {/* Right Column */}
          {/* <div className="relative">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1140153601-min.jpg?alt=media&token=93fce255-b7d8-4e0d-a28a-5e089a94d6e7"
              alt="Caregivers"
              className="w-full h-auto rounded-lg"
            />
          </div> */}
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
      <div className="max-w-6xl my-16 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-indigo-900 to-blue-800 rounded-2xl p-8 md:p-12 overflow-hidden">
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
              <h3 className="text-2xl font-semibold text-white">
                Trusted by Providers Like You
              </h3>
            </div>
            <p className="text-lg text-indigo-100 leading-relaxed">
              Join the growing community of healthcare professionals who trust
              Kinscare
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
              <p className="text-lg text-indigo-100 font-medium">
                Over 200 Providers in the Northwest use Kinscare and the number
                keeps
                <span className="text-emerald-300"> {""} growing daily!</span>
              </p>
            </div>
          </div>

          {/* Provider Logos (Optional) */}
          {/* <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-75">
            <div className="w-20 h-8 bg-indigo-400/10 rounded-lg backdrop-blur-sm" />
            <div className="w-20 h-8 bg-indigo-400/10 rounded-lg backdrop-blur-sm" />
            <div className="w-20 h-8 bg-indigo-400/10 rounded-lg backdrop-blur-sm" />
            <div className="w-20 h-8 bg-indigo-400/10 rounded-lg backdrop-blur-sm" />
          </div> */}
        </div>
      </div>
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
      <div className="flex justify-center py-10">
       <a href="#search-top">
       <button className="bg-indigo-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300">Search Caregivers</button>
       </a>
      </div>
    </div>
  );
};

export default FindLandingPage;
