import { Interweave } from "interweave";
import { MapPin, MapPinCheckIcon, Send } from "lucide-react";
import Link from "next/link";
import React from "react";
import { polyfill } from "interweave-ssr";
import { Button } from "@/components/ui/button";
import ProviderDialog from "@/Providers/Candidates/ProviderDialog";
import { Separator } from "@/components/ui/separator";
import ProfileAvatar from "@/components/ProfileAvatar";
import OAuthDialog from "@/Authentication/OAuthDialog";
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

  const obfuscateName = (name: string): string => {
    const words = name.split(" ");
    return words
      .map((word) => {
        if (word.length <= 2) return word; // Skip obfuscation for words <= 2 characters

        const firstPart = word.slice(0, 3); // Take the first 3 characters
        const lastPart = word.length > 3 ? word.slice(-3) : ""; // Take the last 3 characters (if available)
        const middleLength = Math.max(
          0,
          word.length - firstPart.length - lastPart.length
        ); // Calculate middle part length
        const middlePart = "*".repeat(middleLength); // Obfuscate the middle part

        return `${firstPart}${middlePart}${lastPart}`;
      })
      .join(" ");
  };

  const fname = obfuscateName(similarCaregivers.fname);
  const lname = obfuscateName(similarCaregivers.lname);
  return (
    <div key={similarCaregivers.userID} className="w-full  mb-4">
      <Link href={`/caregivers/${similarCaregivers.userID}`}>
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
                    {fname} {lname}
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
                  .map(
                    (
                      sch:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            any,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<React.AwaitedReactNode>
                        | null
                        | undefined,
                      index: React.Key | null | undefined
                    ) => (
                      <div
                        key={index}
                        className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                      >
                        <span className="text-sm text-gray-600">{sch}</span>
                      </div>
                    )
                  )}
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

async function CaregiverDetails({ candidateID }: { candidateID: string }) {
  let data = await fetch(
    `https://api.kinscare.org/api/v1/providers/caregivers/${candidateID}`,
    { cache: "no-cache" }
  );
  const response = await data.json();
  //   console.log(response.caregiver);
  const { caregiver, similarCaregivers } = response;
  const availability = false;
  const obfuscateName = (name: string): string => {
    const words = name.split(" ");
    return words
      .map((word) => {
        if (word.length <= 2) return word; // Leave very short words unchanged
        if (word.length <= 6) {
          // For words with <= 6 characters, obfuscate the middle
          const firstPart = word.slice(0, 1); // First character
          const lastPart = word.slice(-1); // Last character
          const middlePart = "*".repeat(
            word.length - firstPart.length - lastPart.length
          );
          return `${firstPart}${middlePart}${lastPart}`;
        } else {
          // For words longer than 6 characters, use the first 3 and last 3 characters
          const firstPart = word.slice(0, 3);
          const lastPart = word.slice(-3);
          const middlePart = "*".repeat(
            word.length - firstPart.length - lastPart.length
          );
          return `${firstPart}${middlePart}${lastPart}`;
        }
      })
      .join(" ");
  };

  const fName = obfuscateName(caregiver.fname);
  const lname = obfuscateName(caregiver.lname);

  const obfuscateText = (text: string): string => {
    // Check if the input is an email
    if (text.includes("@")) {
      const [localPart, domain] = text.split("@");
      if (localPart.length <= 2) return text; // Skip short emails
      const obfuscatedLocalPart = `${localPart.slice(0, 3)}${"*".repeat(
        Math.max(localPart.length - 6, 0)
      )}${localPart.slice(-3)}`;
      return `${obfuscatedLocalPart}@${domain}`;
    }

    // If not an email, treat as a name
    const words = text.split(" ");
    return words
      .map((word) => {
        if (word.length <= 2) return word;
        const firstPart = word.slice(0, 3);
        const lastPart = word.slice(-3);
        const middlePart = "*".repeat(
          word.length - firstPart.length - lastPart.length
        );
        return `${firstPart}${middlePart}${lastPart}`;
      })
      .join(" ");
  };

  return (
    <div className="max-w-6xl py-10 space-y-7 mx-auto">
      {/* Grid container */}
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
                  {fName} {lname}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  {caregiver.address && caregiver.address} {caregiver.city},{" "}
                  {caregiver.zipcode}
                </p>
              </div>
              
            </div>
          </div>
          <p className="text-sm ">
                {obfuscateText(caregiver.settings.email)}
              </p>
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
          <OAuthDialog userID={caregiver.userID} message="caregiver">
                <Button className="absolute top-3 right-3">
                  <span className="flex space-x-1 items-center gap-2">
                    <Send size={16} /> Message caregiver
                  </span>{" "}
                </Button>
              </OAuthDialog>
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

      {/* Right Column (Narrower on larger screens, full-width below) */}
      <p className="antialiased font-bold ">Similar Caregivers</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {/* Map through your caregivers and display each card */}
        {similarCaregivers.map((caregiver: any) => (
          <div key={caregiver.id}>
            <CandidatesCard similarCaregivers={caregiver} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaregiverDetails;
