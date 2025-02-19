import React from "react";
import SearchBar from "./SearchBar";
const FindLandingPage = async () => {
  return (
    <div>
      <div
        className="relative w-full h-[95vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/pexels-cottonbro-7579831%20(1).jpg?alt=media&token=17ff67c6-208a-4eae-884d-6e3bb1b158c0')",
        }}
      >
        {/* Enhanced Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 pt-20 lg:pt-0">
          {/* Headline */}
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Find the{" "}
            <span className="bg-[conic-gradient(var(--tw-gradient-stops))] from-yellow-500 via-red-500 to-pink-500 text-transparent bg-clip-text">
              Perfect Caregiver
            </span>{" "}
          </h1>

          <p className="text-gray-300  max-w-2xl mb-8">
            Find local caregivers ready to work for you—quickly and
            effortlessly! Whether you’re looking for{" "}
            <span className="text-white font-semibold">full-time</span>,{" "}
            <span className="text-white font-semibold">part-time</span>, 
            <span className="text-white font-semibold"> live-in</span>
            <span className="text-white">, on-call</span>{" "}
            <span className="text-white"> or Weekend caregivers</span>. Kinscare
            makes it easy to find and match with qualified caregivers. Start
            your search today and connect with the perfect caregiver in no time!
          </p>

          {/* Search Bar */}
         
            <SearchBar />
          <p className="text-gray-300 text-lg max-w-2xl mb-8">
            Over{" "}
            <span className="text-white font-bold">  30 caregivers </span>{" "}
            joined Kinscare
          </p>
        </div>
      </div>
      <div className="bg-gray-100 py-10 px-6 md:px-12">
        <div className="py-10">
          <h2 className="text-3xl md:text-4xl text-center font-bold tracking-tight text-gray-800 mb-3">
            Why Choose <span className="text-blue-600">Kinscare?</span>
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Kinscare focuses on connecting you with experienced caregivers,
            saving you time and money.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}

          {/* Right Column */}
          <div className="relative">
            <img
              src="https://zone-ui.vercel.app/assets/illustrations/illustration-recruitment.svg"
              alt="Caregivers"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div>
            <h4 className="tracking-tight text-3xl font-bold text-gray-800 mb-6 ">
              Our <span className="text-red-600">caregivers</span>
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
                  Caregivers available for <strong>full-time, part-time</strong>
                  , live-in, on-call, and weekend shifts.
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
                  Will accommodate or work with your schedule
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
                  Have cared for persons with mental health illness, dementia,
                  developmental disabilities, traumatic brain injury and all
                  types of conditions
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
                <p className="text-gray-700 ">Live in or near your community</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <h4 className="tracking-tight text-3xl font-bold text-gray-800 mb-6 ">
              <span className="text-red-500">Use Kinscare</span> because
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mr-4">
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
                  It has No initiation fees or cancellation fees.
                </p>
              </li>
              <li className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 shrink-0 text-blue-600 flex items-center justify-center rounded-full mr-4">
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
                  It has No hourly rate agency fees - you negotiate with the
                  caregiver(s) directly
                </p>
              </li>
              <li className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mr-4">
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
                  Kinscare’s focus on caregivers and ease of use saves you time
                  and money
                </p>
              </li>
            </ul>
          </div>

          {/* Right Column */}
          <div className="relative">
            <img
              src="https://zone-ui.vercel.app/assets/illustrations/illustration-recruitment.svg"
              alt="Caregivers"
              className="w-full h-auto rounded-lg"
            />
          </div>
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
    </div>
  );
};

export default FindLandingPage;
