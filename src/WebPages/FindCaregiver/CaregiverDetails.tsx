import OAuthDialog from "@/Authentication/OAuthDialog";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Interweave } from "interweave";
import { polyfill } from "interweave-ssr";
import { MapPin, Send } from "lucide-react";
import Link from "next/link";
import React from "react";
polyfill();

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
          <OAuthDialog
            caregiver={similarCaregivers}
            userID={similarCaregivers.userID}
            message="caregiver"
          >
            <Button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              <span className="flex items-center gap-2">
                <Send size={18} /> Message Caregiver
              </span>
            </Button>
          </OAuthDialog>
        </div>

        {/* Dialog Box for Hire Action */}
      </Link>
    </div>
  );
};

async function CaregiverDetails({ candidateID }: { candidateID: string }) {
  let data = await fetch(
    `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/caregivers/${candidateID}`,
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
    <div className="max-w-6xl mx-auto py-12 px-2 xl:px-0 space-y-10">
      {/* Main Profile Card */}
      <div className="relative shadow-lg border bg-white border-gray-100 rounded-2xl p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-6 sm:space-y-0">
          {/* Profile Info */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <ProfileAvatar
                size="w-24 h-24"
                name={`${caregiver?.fname} ${caregiver?.lname}`}
                profileImage={caregiver?.profileImage}
              />
              {availability && (
                <span className="absolute top-2 right-2">
                  <span className="relative flex h-4 w-4 items-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {fName} {lname}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                <MapPin size={16} />
                {caregiver.address && caregiver.address} {caregiver.city},{" "}
                {caregiver.zipcode}
              </p>
            </div>
          </div>
        </div>
        {/* Email */}
        <p className="text-sm mt-3 text-gray-700">
          {obfuscateText(caregiver.settings.email)}
        </p>

        {/* Licenses and Availability */}
        <div className="mt-4 flex flex-wrap gap-3">
          {caregiver.licenses.slice(0, 3).map((license: any, index: any) => (
            <span
              key={index}
              className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600"
            >
              {license}
            </span>
          ))}
          {caregiver.availability
            .slice(0, 3)
            .map((schedule: any, index: number) => (
              <span
                key={index}
                className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600"
              >
                {schedule}
              </span>
            ))}
        </div>

        {/* Contact Button */}
        <div className="mt-4">
          <OAuthDialog
            caregiver={caregiver}
            userID={caregiver.userID}
            message="caregiver"
          >
            <Button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              <span className="flex items-center gap-2">
                <Send size={18} /> Message Caregiver
              </span>
            </Button>
          </OAuthDialog>
        </div>

        {/* About Section */}
        <div className="mt-10 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
          <div className="text-sm text-gray-700 leading-relaxed">
            <Interweave content={caregiver.certifications} />
          </div>
        </div>

        {/* Additional Information */}
        {caregiver.mobility && (
          <div className="mt-6">
            <p className="text-sm">
              <strong className="font-semibold text-gray-900">Mobility:</strong>{" "}
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
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600"
                  >
                    {alert}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Similar Caregivers Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Similar Caregivers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarCaregivers.map((caregiver: any) => (
            <CandidatesCard key={caregiver.id} similarCaregivers={caregiver} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CaregiverDetails;
 