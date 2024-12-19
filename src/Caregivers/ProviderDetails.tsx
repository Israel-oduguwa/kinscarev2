import Head from "next/head";
import { MapPin, BadgeCheck } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const PostedJobs = ({ job }: any) => {
  return (
    <Link href={`/vitae/jobs/${job._id}`}>
      <div className="mt-4">
        <div className="border rounded-md border-gray-200 p-4">
          <div className="flex gap-3 mb-3 items-center">
            {job.profileImage && (
              <img
                className="h-8 w-8"
                src={
                  job.profileImage
                    ? job.profileImage
                    : "profileImage:userData?.profileImage,"
                }
                alt="company logo"
              />
            )}
            <div>
              <p className="text-sm font-medium mb-1">{job.title}</p>
              <p className="text-xs font-normal">
                {job.contacts.zipcode}, {job.contacts.city}
              </p>
            </div>
          </div>
          <div className="w-full flex-wrap gap-4 flex">
            {job.licenses
              .slice(0, 2)
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
            {job.schedule
              .slice(0, 2)
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
    </Link>
  );
};

export default async function ProviderDetails({
  providerId,
}: {
  providerId: string;
}) {
  // Fetch provider data
  const response = await fetch(
    `https://api.kinscare.org/api/v1/caregivers/get-provider/${providerId}`,
    { cache: "no-cache" }
  );
  const data = await response.json();

  const provider = data.provider;
  const jobs = data.jobs;

  return (
    <>
      <Head>
        <title>{`Provider: ${provider.name}`}</title>
        <meta
          name="description"
          content={`Learn more about ${provider.name}, a provider based in ${provider.city}.`}
        />
      </Head>
      <div className="max-w-6xl px-6 md:px-10 py-10 xl:px-0 mx-auto space-y-10">
        {/* Provider Profile */}
        <div className="relative shadow-sm border bg-white border-gray-200 rounded-lg p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row space-y-3 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                <ProfileAvatar
                  size="w-20 h-20"
                  name={`${provider.name}`}
                  profileImage={provider.profileImage}
                />
                {provider.contactDetails?.payment_verified && (
                  <span className="absolute bottom-0 right-0">
                    <BadgeCheck
                      size={20}
                      className="text-green-500 bg-white rounded-full"
                    />
                  </span>
                )}
              </div>

              {/* Name and Location */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {provider.name}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  {provider.address}, {provider.city}, {provider.zipcode}
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900">About</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {provider.trainer === "yes"
                ? "Certified trainer available."
                : "Details about this provider are unavailable."}
            </p>
          </div>

          {/* Licenses and Settings */}
          {provider.type_of_setting && (
            <div className="mt-4 flex flex-wrap gap-2">
              {provider.type_of_setting.map((setting: string, idx: number) => (
                <Badge key={idx} variant="outline">
                  {setting}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Jobs Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Posted Jobs ({jobs.length})
          </h3>
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <div key={job._id}>
                  <PostedJobs job={job} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No jobs posted yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
