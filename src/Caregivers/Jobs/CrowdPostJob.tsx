import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import Image from "next/image";
import {
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  Car,
  BadgeCheck,
  DollarSign,
  Mail,
} from "lucide-react";
import React from "react";
import CrowdPostActions from "./CrowdPostActions";
import MatchingCaregiver from "../../Providers/Jobs/MatchingCaregiver";
import ProfileImage from "../../Providers/User/ProfileImage";
import { ReferCaregiverDialog } from "./ReferCargiverDialog";

polyfill();

interface JobProps {
  jobID: string;
  isProvider: boolean;
}

export default async function CrowdPostJob({ jobID, isProvider }: JobProps) {
  const res = await fetch(
    `https://api.kinscare.org/api/v1/providers/crowd-post/${jobID}`,
    { cache: "no-cache" }
  );
  const { job, similarJobs } = await res.json();

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
console.log(job)
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
        {/* Main Job Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {!isProvider && (
          <div className="px-6 lg:px-8 pt-4">
            <ReferCaregiverDialog
              newJobID={job?.newJobID}
              referral={job.referral}
              claimed={job?.claimed}
              title={job?.title}
              jobID={jobID}
            />
          </div>
        )}
          <div className="flex flex-col lg:flex-row p-6 lg:p-8  py-2 gap-8">
            {/* Job Info */}
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold  text-gray-900 tracking-tight mb-2">
                    {job?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <div className="flex items-center bg-blue-50 rounded-full px-3 py-1">
                      <MapPin className="w-4 h-4 text-blue-600 mr-1.5" />
                      <span className="text-sm font-medium">
                        {job?.address}, {job?.city}
                      </span>
                    </div>
                    {job?.mobility && (
                      <div className="flex items-center bg-emerald-50 rounded-full px-3 py-1">
                        <Car className="w-4 h-4 text-emerald-600 mr-1.5" />
                        <span className="text-sm font-medium">
                          {job.mobility === "car_needed"
                            ? "Car Required"
                            : "No Car Needed"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center space-y-4">
                  <div className="relative">
                    <ProfileImage  className="w-20 h-20 rounded-full ring-4 ring-white shadow-lg" />
                    <BadgeCheck className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 bg-white rounded-full p-0.5" />
                  </div>
                  <CrowdPostActions
                    jobID={jobID}
                    isProvider={isProvider}
                    claimed={job?.claimed}
                    employerEmail={job?.email}
                  />
                </div>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                  <Calendar className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Start Date
                    </p>
                    <p className="font-medium text-sm text-gray-900">
                      {job?.start_date
                        ? formatDate(job.start_date)
                        : "Flexible"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                  <Clock className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Schedule
                    </p>
                    <p className="font-medium text-sm text-gray-900">
                      {job?.schedule.map((lic: any, id: number) => (
                        <span key={id}>{lic} </span>
                      )) || "Flexible hours"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                  <DollarSign className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Pay Rate
                    </p>
                    <p className="font-medium text-sm text-gray-900">
                      {job?.compensation || "Negotiable"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                  <User className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Licenses
                    </p>
                    <p className="font-medium text-gray-900">
                      {job?.licenses.map((lic: any, id: number) => (
                        <span className="mr-1 text-sm" key={id}>
                          {lic}{" "}
                        </span>
                      )) || "Any experience"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Job Description
                </h3>
                <div className=" discussion-content prose prose-indigo prose-h1:mx-2 prose-p:m-0 prose-h2:mx-2 ">
                  <Interweave content={job?.description || ""} />
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <div className="px-2 md:px-2  w-full max-w-md">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-gradient-to-tr from-blue-800 to-blue-600 shadow">
                      <User className="w-6 h-6 text-blue-100" />
                    </span>
                    <h4 className="text-xl font-bold text-gray-900">
                      Employer
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-indigo-400" />
                      <span className="text-base font-medium text-gray-900">
                        {job?.employer_name || (
                          <span className="italic text-gray-300">No name</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-indigo-400" />
                      <span className="text-base text-gray-700">
                        {job?.email || (
                          <span className="italic text-gray-300">No email</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-indigo-400" />
                      <span className="text-base text-gray-700">
                        {job?.phone_number || (
                          <span className="italic text-gray-300">No phone</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* <div className="pt-4 text-xs text-gray-400">
                    Preferred Contact: Phone or Email
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        {job?.applicants?.length > 0 && (
          <div className="bg-white my-8 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Applications ({job.applicants.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Sorted by most recent
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.applicants.map((app: any) => (
                  <div
                    key={app.userID}
                    className="flex flex-col border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200"
                  >
                    <div className="flex items-start mb-4">
                      <div className="relative mr-4">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full p-0.5" />
                      </div>
                      <div>
                        <p className="text-lg capitalize font-bold text-gray-900">
                          {app.name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied: {formatDate(app.applied_on)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Licenses */}
                      {app.licenses?.map((lic: any) => (
                        <span
                          key={lic}
                          className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full font-medium"
                        >
                          {lic}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {/* Availability */}
                        {app.availability?.map((slot: any) => (
                          <span
                            key={slot}
                            className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Similar Jobs Section */}
        {similarJobs?.length > 0 && (
          <div className="bg-white my-8 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Similar Jobs Nearby
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarJobs.slice(0, 3).map((similarJob: any) => (
                  <div
                    key={similarJob.id}
                    className="border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-gray-900 truncate pr-2">
                        {similarJob.title}
                      </h4>
                      <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                        {similarJob.distance} miles
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 text-gray-500 mr-1.5" />
                      <span className="truncate">{similarJob.city}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {similarJob.mobility && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                          {similarJob.mobility === "car_needed"
                            ? "🚗 Car Required"
                            : "🚶 No Car"}
                        </span>
                      )}
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        ${similarJob.pay_rate}/hr
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 line-clamp-3 mb-4">
                      {similarJob.description.substring(0, 100)}...
                    </div>

                    <button className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      View Job Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
