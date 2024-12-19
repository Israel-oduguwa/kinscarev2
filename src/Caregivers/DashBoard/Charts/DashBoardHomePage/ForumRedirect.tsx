import Link from "next/link";
import React from "react";

function ForumRedirect({ userData }: any) {
  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-100 hover:shadow-2xl">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r flex flex-col space-y-3 from-purple-500 via-pink-500 to-red-500 p-6 rounded-lg relative overflow-hidden">
        <h2 className="text-white text-2xl font-bold  z-10 relative">
          Join our community
        </h2>
        <p className="text-purple-100 text-sm z-10 relative">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus
          explicabo qui dolorem ratione laboriosam quos praesentium culpa.
          Cumque, Invite
        </p>

        <Link href="/community">
          <button className="w-full inline-block text-center   from-purple-500 via-pink-500 to-red-500 bg-white font-semibold py-3 px-6 rounded-lg shadow-md hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-all duration-300">
            Join the Community
          </button>
        </Link>
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 opacity-40 rounded-full"></div>
        <div className="absolute -top-5 -right-5 w-20 h-20 bg-gradient-to-r from-pink-300 to-red-300 opacity-30 rounded-full"></div>
      </div>
    </div>
  );
}

export default ForumRedirect;
