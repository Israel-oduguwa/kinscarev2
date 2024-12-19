import { Interweave } from "interweave";
import { MapPin, MapPinCheckIcon, Send } from "lucide-react";
import Link from "next/link";
import React from "react";
import { polyfill } from "interweave-ssr";
import { Button } from "@/components/ui/button";
import ProviderDialog from "./ProviderDialog";
import { Separator } from "@/components/ui/separator";
import ProfileAvatar from "@/components/ProfileAvatar";
import JobPostModal from "../Jobs/JobPostModal";
import ProtectedCandidatesDetails from "./ProtectedCandidatesDetails";
import Head from "next/head";
polyfill();
// const SimilarCaregivers = ({ similarCaregivers }: any) => {
//   // console.log(similarCaregivers);
//   return (
//     <div className="w-full">
//       <p className="text-sm antialiased font-medium">Similar caregivers</p>
//       {similarCaregivers.map((caregiver: any) => (
//         <Link href={`/provider/candidates/${caregiver._id}`}>
//           <div className="mt-4">
//             <div className="border rounded-md border-gray-200 p-4">
//               <div className="flex gap-3 mb-3 items-center">
//                 <img
//                   className="h-10 w-10 rounded-lg"
//                   src="https://cdn.dribbble.com/users/4949363/avatars/normal/606bb85ee728fd3d78bbddf7e70b3901.jpg?1676454777"
//                   alt="screen"
//                 />
//                 <div>
//                   <p className="text-sm font-medium mb-1">
//                     {caregiver.fname} {caregiver.lname}
//                   </p>
//                   <p className="text-xs font-normal">
//                     {caregiver.zipcode}, {caregiver.city}
//                   </p>
//                 </div>
//               </div>
//               <div className="w-full flex-wrap gap-4 flex">
//                 {caregiver.licenses
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
//                 {caregiver.availability
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

const CandidatesCard = ({ similarCaregivers }: any) => {
  const availability = false;

  const OpenHireModal = () => {
    //the hire caregiver modal would be open here
    // openDialog();
  };
  const stopPropagation = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };
  return (
    <div key={similarCaregivers.userID} className="w-full  mb-4">
      <Link href={`/provider/candidates/${similarCaregivers.userID}`}>
        <div className="bg-white  shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="mb-1 flex  min-h-52   flex-col space-y-4">
            <div className="flex justify-between">
              <div className="flex space-x-2 items-center">
                {/* <img
                  className="h-14 w-14 rounded-full"
                  src="https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                  alt="profile-image"
                /> */}
                <ProfileAvatar
                  size="w-12 h-12"
                  name={`${similarCaregivers?.name}`}
                  profileImage={similarCaregivers?.profileImage}
                />
                <div>
                  <p className="antialiased flex space-x-2 font-bold relative text-gray-900">
                    {similarCaregivers.name}{" "}
                    {availability && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 flex flex-wrap gap-0.5 space-x-1 items-center">
                    <MapPin size={15} />
                    {similarCaregivers.city}, {similarCaregivers.zipcode}{" "}
                    <span className="h-1 w-1 bg-gray-700 rounded-full"></span>
                    {availability && (
                      <span className="text-sm text-green-600 antialiased">
                        Available now
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="w-full flex-wrap gap-4 flex">
                {similarCaregivers.licenses
                  .slice(0, 2)
                  .map((license: any, index: any) => (
                    <div
                      key={index}
                      className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                    >
                      <span className="text-sm text-gray-600">{license}</span>
                    </div>
                  ))}
                {similarCaregivers.availability
                  .slice(0, 1)
                  .map((sch: any, index: React.Key | null | undefined) => (
                    <div
                      key={index}
                      className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                    >
                      <span className="text-sm text-gray-600">{sch}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="w-full ">
              <p className="flex mb-2 text-sm font-bold items-center">
                Certifications
              </p>
              <div className="text-sm text-gray-600 line-clamp-2">
                <Interweave content={similarCaregivers.certifications} />
              </div>
            </div>
          </div>
          <ProviderDialog similar candidate={similarCaregivers} />
        </div>

        {/* Dialog Box for Hire Action */}
      </Link>
    </div>
  );
};

async function CandidateDetails({ candidateID }: { candidateID: string }) {
  let data = await fetch(
    `http://localhost:8081/api/v1/providers/caregivers/${candidateID}`,
    { cache: "no-cache" }
  );
  const response: any = await data.json();
  //   console.log(response.caregiver);
  const { caregiver, similarCaregivers } = response;
  const availability = false;
  console.log(caregiver);
  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{`Profile of ${caregiver.fname} ${caregiver.lname}`}</title>
        <meta
          name="description"
          content={`View the profile of ${caregiver.fname} ${caregiver.lname}, a professional caregiver in ${caregiver.city}.`}
        />
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph Meta Tags */}
        <meta
          property="og:title"
          content={`Caregiver: ${caregiver.fname} ${caregiver.lname}`}
        />
        <meta
          property="og:description"
          content={`Discover ${caregiver.fname} ${
            caregiver.lname
          }, a caregiver with expertise in ${caregiver.licenses.join(
            ", "
          )}. Available in ${caregiver.city}.`}
        />
        <meta property="og:image" content={caregiver.profileImage} />
        <meta
          property="og:url"
          content={`http://yourwebsite.com/caregiver/${candidateID}`}
        />
        <meta property="og:type" content="profile" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`Caregiver: ${caregiver.fname} ${caregiver.lname}`}
        />
        <meta
          name="twitter:description"
          content={`Learn more about ${caregiver.fname}, a professional caregiver in ${caregiver.city}.`}
        />
        <meta name="twitter:image" content={caregiver.profileImage} />
      </Head>
      <div className="max-w-6xl px-6 md:px-10 py-10 xl:px-0 mx-auto space-y-10">
        {/* Candidate Profile */}
        <div className="relative shadow-sm border bg-white border-gray-200 rounded-lg p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row space-y-3 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ProfileAvatar
                  size="w-20 h-20"
                  name={`${caregiver?.fname} ${caregiver?.lname}`}
                  profileImage={caregiver?.profileImage}
                />
                {availability && (
                  <span className="absolute top-1 right-1">
                    <span className="relative flex h-4 w-4 items-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {caregiver.fname} {caregiver.lname}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  {caregiver.address && caregiver.address} {caregiver.city},{" "}
                  {caregiver.zipcode}
                </p>
              </div>
            </div>
            <ProviderDialog detailsPage={true} candidate={caregiver} />
          </div>

          {/* Licenses and Availability */}
          <div className="w-full flex-wrap gap-4 flex">
            {/* Display only the first 2 licenses */}
            {caregiver.licenses
              .slice(0, 3)
              .map((license: any, index: React.Key | null | undefined) => (
                <div
                  key={index}
                  className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                >
                  <span className="text-xs antialiased text-gray-600">
                    {license}
                  </span>
                </div>
              ))}
            {/* Display only the first 2 schedules */}
            {caregiver.availability
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

          {/* Contact Details */}
          <div className="mt-6">
            <ProtectedCandidatesDetails
              name={`${caregiver.fname} ${caregiver.lname}`}
              email={caregiver.settings.email}
              tel={caregiver.settings.tel}
            />
          </div>

          {/* About Section */}
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-semibold text-gray-900">About Me</h3>
            <div className="text-sm text-gray-700 leading-relaxed">
              <Interweave content={caregiver.certifications} />
            </div>
          </div>

          {/* Additional Information */}
          {caregiver.mobility && (
            <div className="mt-6">
              <p className="text-sm">
                <strong className="font-semibold text-gray-900">
                  Mobility:
                </strong>{" "}
                {caregiver.mobility}
              </p>
            </div>
          )}
          {caregiver.settings.alert_preferences && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Alert Preferences
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {caregiver.settings.alert_preferences.map(
                  (alert: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-gray-100 text-gray-800 text-xs rounded-full px-3 py-1"
                    >
                      {alert}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Similar Caregivers Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Similar Caregivers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {similarCaregivers.map((caregiver: any) => (
              <CandidatesCard
                key={caregiver.id}
                similarCaregivers={caregiver}
              />
            ))}
          </div>
        </div>
      </div>
      <JobPostModal caregiver={caregiver}/>
    </>
  );
}

export default CandidateDetails;
