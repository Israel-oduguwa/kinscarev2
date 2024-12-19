import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MapPin, MapPinCheckIcon } from "lucide-react";
import React from "react";
import JobPostActions from "./JobPostActions";
import MatchingCaregiver from "./MatchingCaregiver";
import ProfileImage from "../User/ProfileImage";
polyfill();
interface JobProps {
  jobID: string;
}

// const SimilarJobs = ({ similarJobs }: any) => {
//   // console.log(similarJobs);
//   return (
//     <div className="w-full">
//       <p className="text-sm antialiased font-medium">Similar Jobs</p>
//       {similarJobs.map((job: any) => (
//         <Link href={`/vitae/jobs/${job._id}`}>
//           <div className="mt-4">
//             <div className="border rounded-md border-gray-200 p-4">
//               <div className="flex gap-3 mb-3 items-center">
//                 <img
//                   className="h-10 w-10 rounded-lg"
//                   src="https://cdn.dribbble.com/users/4949363/avatars/normal/606bb85ee728fd3d78bbddf7e70b3901.jpg?1676454777"
//                   alt="screen"
//                 />
//                 <div>
//                   <p className="text-sm font-medium mb-1">{job.title}</p>
//                   <p className="text-xs font-normal">
//                     {job.contacts.zipcode}, {job.contacts.city}
//                   </p>
//                 </div>
//               </div>
//               <div className="w-full flex-wrap gap-4 flex">
//                 {job.licenses
//                   .slice(0, 2)
//                   .map(
//                     (
//                       license:
//                         | string
//                         | number
//                         | bigint
//                         | boolean
//                         | React.ReactElement<
//                             any,
//                             string | React.JSXElementConstructor<any>
//                           >
//                         | Iterable<React.ReactNode>
//                         | React.ReactPortal
//                         | Promise<React.AwaitedReactNode>
//                         | null
//                         | undefined,
//                       index: React.Key | null | undefined
//                     ) => (
//                       <div
//                         key={index}
//                         className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
//                       >
//                         <span className="text-xs antialiased text-gray-600">
//                           {license}
//                         </span>
//                       </div>
//                     )
//                   )}
//                 {job.schedule
//                   .slice(0, 2)
//                   .map(
//                     (
//                       sch:
//                         | string
//                         | number
//                         | bigint
//                         | boolean
//                         | React.ReactElement<
//                             any,
//                             string | React.JSXElementConstructor<any>
//                           >
//                         | Iterable<React.ReactNode>
//                         | React.ReactPortal
//                         | Promise<React.AwaitedReactNode>
//                         | null
//                         | undefined,
//                       index: React.Key | null | undefined
//                     ) => (
//                       <div
//                         key={index}
//                         className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
//                       >
//                         <span className="text-xs antialiased text-gray-600">
//                           {sch}
//                         </span>
//                       </div>
//                     )
//                   )}
//               </div>
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// };
async function CaregiverJob({ jobID }: JobProps) {
  let data = await fetch(
    `http://localhost:8081/api/v1/caregivers/job/${jobID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  // console.log(response.job);
  const { job, similarJobs } = response;
  // console.log(job);
  return (
    <div>
      <div className="max-w-6xl py-6 px-6 min-h-[100vh] 2xl:px-0 mx-auto">
        <div className="relative shadow-sm border bg-white border-gray-200 mb-4 rounded-lg p-6">
          <div className="w-full mb-4">
            <div className="flex gap-4 flex-wrap items-center lg:flex-nowrap justify-between">
              <h2 className="text-3xl text-gray-800 tracking-tight font-semibold">
                {job.title}
              </h2>
              <div>
                <JobPostActions jobID={jobID} />
              </div>
            </div>
          </div>
          <div className="mb-10">
            <div className="flex space-x-2 items-center">
              <ProfileImage className="w-20 h-20" />
              <div>
                <div className="flex gap-2 mb-3">
                  <p className="text-sm font-medium ">{job.provider}</p>
                  <p className="flex gap-0.5 text-sm  items-center">
                    <MapPin size={14} />
                    {job.contacts.address && job.contacts.address}{" "}
                    {job.contacts.city}, {job.contacts.zipcode}
                  </p>
                </div>
                {job.mobility && (
                  <p className="mb-3 w-28 font-bold text-xs bg-green-100 text-green-600 px-2 rounded-lg py-1 ">
                    {job.mobility === "car_needed"
                      ? "Car Needed"
                      : "Car not needed"}
                  </p>
                )}
                <div className="w-full flex-wrap gap-4 flex">
                  {/* Display only the first 2 licenses */}
                  {job.licenses
                    .slice(0, 3)
                    .map(
                      (license: any, index: React.Key | null | undefined) => (
                        <div
                          key={index}
                          className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                        >
                          <span className="text-xs antialiased text-gray-600">
                            {license}
                          </span>
                        </div>
                      )
                    )}

                  {/* Display only the first 2 schedules */}
                  {job.schedule
                    .slice(0, 3)
                    .map((sch: any, index: React.Key | null | undefined) => (
                      <div
                        key={index}
                        className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                      >
                        <span className="text-xs antialiased text-gray-600">
                          {sch}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="font-semibold mb-1">About this role</p>
            <div className="w-full prose-lg prose-p:text-sm prose-p:mt-1 text-gray-700">
              <Interweave content={job.description} />
            </div>
            {/* <p className="text-sm font-bold mb-2 antialiased">Certification</p> */}
            {/* <div className="text-sm prose-lg  prose-p:text-sm text-gray-600 mb-4">
              <Interweave content={job.certifications} />
            </div> */}

            <div className="mb-4">
              <p className="font-semibold mb-1 ">Minimum Hours Required</p>
              <p className="text-sm font-normal antialiased">
                {job.minHours} hrs
              </p>
            </div>
            <div className="mb-4">
              <p className="w-full  font-semibold  mb-1">Compensation</p>
              <p className="text-sm font-normal antialiased">
                {job.compensation}
              </p>
            </div>
          </div>
          {job.alert_preferences && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2 text-gray-900">
                Alert Preferences
              </p>
              <div className="flex flex-wrap gap-2">
                {job.alert_preferences.map((alert: string, idx: number) => (
                  <div
                    className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                    key={idx}
                  >
                    <span className="text-xs antialiased text-gray-600">
                      {alert}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {MatchingCaregiver.length > 1 && (
          <div className="w-full mt-4">
            <p className="antialiased font-bold mb-2">
              Review these caregivers that match your job post
            </p>

            <MatchingCaregiver jobID={jobID} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CaregiverJob;
