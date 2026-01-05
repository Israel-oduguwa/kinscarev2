import { Interweave } from "interweave";
import { MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import { polyfill } from "interweave-ssr";
import ProviderDialog from "./ProviderDialog";
import ProfileAvatar from "@/components/ProfileAvatar";
import ProtectedCandidatesDetails from "./ProtectedCandidatesDetails";
import Head from "next/head";
import StartConversationButton from "./StartConversationButton";
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
  return (
    <div key={similarCaregivers.userID} className="w-full mb-4">
      <Link href={`/provider/candidates/${similarCaregivers.userID}`}>
        <div className="bg-white/90 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)] border border-slate-200/70 rounded-2xl p-5 hover:shadow-[0_18px_50px_-30px_rgba(15,23,42,0.5)] transition-all duration-200">
          <div className="mb-1 flex min-h-52 flex-col space-y-4">
            <div className="flex justify-between">
              <div className="flex space-x-2 items-center">
                {/* <img
                  className="h-14 w-14 rounded-full"
                  src="https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                  alt="profile-image"
                /> */}
                <ProfileAvatar
                  size="w-14 h-14"
                  name={`${similarCaregivers?.name}`}
                  profileImage={similarCaregivers?.profileImage}
                />
                <div className="min-w-0">
                  <p className="antialiased flex space-x-2 font-semibold relative text-slate-900 truncate">
                    {similarCaregivers.name}{" "}
                    {availability && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 flex flex-wrap gap-0.5 space-x-1 items-center">
                    <MapPin size={14} />
                    {similarCaregivers.city}, {similarCaregivers.zipcode}{" "}
                    <span className="h-1 w-1 bg-gray-700 rounded-full"></span>
                    {availability && (
                      <span className="text-sm text-emerald-600 antialiased">
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
                      className="relative text-xs bg-slate-100 text-slate-700 rounded-full py-1 px-3"
                    >
                      <span className="text-xs text-slate-600">{license}</span>
                    </div>
                  ))}
                {similarCaregivers.availability
                  .slice(0, 1)
                  .map((sch: any, index: React.Key | null | undefined) => (
                    <div
                      key={index}
                      className="relative text-xs bg-emerald-50 text-emerald-700 rounded-full py-1 px-3"
                    >
                      <span className="text-xs text-emerald-700">{sch}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="w-full ">
              <p className="flex mb-2 text-sm font-semibold items-center text-slate-900">
                Certifications
              </p>
              <div className="text-sm text-slate-600 line-clamp-2">
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
  // console.log(caregiver, "check details");
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
          content={`https://kinscare.org/caregiver/${candidateID}`}
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
      <div className="max-w-7xl px-2 md:px-10 py-6 md:py-10 2xl:px-0 mx-auto space-y-10">
        {/* Candidate Profile */}
        <div className="relative shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] border border-slate-200/70 bg-white/80 backdrop-blur rounded-2xl p-4 md:p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col flex-wrap sm:flex-row space-y-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ProfileAvatar
                  size="w-24 h-24"
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
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  {caregiver.fname} {caregiver.lname}
                </h2>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  {caregiver.address && caregiver.address} {caregiver.city},{" "}
                  {caregiver.zipcode}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quick actions
                </p>
                <div className="mt-3 flex w-full flex-col gap-2">
                  <StartConversationButton
                    caregiver={{
                      id: caregiver.userID,
                      fname: caregiver.fname,
                      lname: caregiver.lname,
                      profileImage: caregiver.profileImage,
                      phone: caregiver.settings?.tel,
                    }}
                    className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    fullWidth
                    size="lg"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Start a real-time chat or send a quick message.
                </p>
              </div>
            </div>
          </div>

          {/* Licenses and Availability */}
          <div className="w-full flex-wrap gap-2 flex">
            {/* Display only the first 2 licenses */}
            {caregiver.licenses
              .slice(0, 3)
              .map((license: any, index: React.Key | null | undefined) => (
                <div
                  key={index}
                  className="relative text-xs bg-slate-100 text-slate-700 rounded-full py-1 px-3"
                >
                  <span className="text-xs antialiased text-slate-600">
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
                  className="relative text-xs bg-emerald-50 text-emerald-700 rounded-full py-1 px-3"
                >
                  <span className="text-xs antialiased text-emerald-700">
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
            <h3 className="text-sm font-semibold text-slate-900">About Me</h3>
            <div className="text-sm text-slate-700 leading-relaxed">
              <Interweave content={caregiver.certifications} />
            </div>
          </div>

          {/* Additional Information */}
          {caregiver.mobility && (
            <div className="mt-6">
              <p className="text-sm">
                <strong className="font-semibold text-slate-900">
                  Mobility:
                </strong>{" "}
                {caregiver.mobility}
              </p>
            </div>
          )}
          {caregiver.settings.alert_preferences && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">
                Alert Preferences
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {caregiver.settings.alert_preferences.map(
                  (alert: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-100 text-slate-700 text-xs rounded-full px-3 py-1"
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
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Similar Caregivers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {similarCaregivers.map((caregiver: any, index:any) => (
              <div key={caregiver._id}>
                  <CandidatesCard
                
                similarCaregivers={caregiver}
              />
              </div>
            
            ))}
          </div>
        </div>
      </div>
      {/* <JobPostModal caregiver={caregiver} /> */}
    </>
  );
}

export default CandidateDetails;
