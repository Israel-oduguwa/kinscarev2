import Link from "next/link";
import React from "react";
import { Users } from "lucide-react";

function ForumRedirect({ userData }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Gradient header with decorative blobs */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-40" />
        <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-gradient-to-r from-pink-300 to-red-300 opacity-30" />

        {/* Content */}
        <h2 className="relative z-10 text-2xl font-bold text-white">
          Join our community
        </h2>
        <p className="relative z-10 mt-2 text-sm text-purple-100">
          Our discussion forum is a space where you can connect with others already
          enrolled in training programs or working in the field.
        </p>
      </div>

      {/* Extra chips + CTA section */}
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            <Users className="h-4 w-4 text-indigo-600" />
            Growing community
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Safe & supportive
          </span>
        </div>

        <Link href="/community" className="inline-block w-full sm:w-auto">
          <button className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Join the Community
          </button>
        </Link>
      </div>
    </div>
  );
}

export default ForumRedirect;
