import Link from "next/link";
import React from "react";

function LeftFilter({ params }: any) {
//   console.log(params);
  return (
    <div className="sticky top-10">
      <ul className="flex-column space-y space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 md:mb-0">
        <li>
          <Link href={`/community?category=Questions&page=1&limit=10`}>
            <div
              className={`inline-flex items-center px-4 py-3  ${
                params?.category === "Questions"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-900"
              } rounded-lg w-full hover:bg-blue-600 hover:text-white`}
            >
              Questions
            </div>
          </Link>
        </li>
        <li>
          <Link href={`/community?category=Schools&page=1&limit=10`}>
            <div
              className={`inline-flex items-center px-4 py-3 ${
                params?.category === "Schools"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-900"
              } rounded-lg hover:bg-blue-600 w-full hover:text-white `}
            >
              Schools
            </div>
          </Link>
        </li>
        <li>
          <Link href={`/community?category=Programs&page=1&limit=10`}>
            <div
              className={`inline-flex items-center px-4 py-3 ${
                params?.category === "Programs"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-900"
              } rounded-lg hover:bg-blue-600 w-full hover:text-white `}
            >
              Programs
            </div>
          </Link>
        </li>
        <li>
          <Link href={`/community?category=Jobs&page=1&limit=10`}>
            <div
              className={`inline-flex items-center px-4 py-3 ${
                params?.category === "Jobs"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-900"
              } rounded-lg hover:bg-blue-600 w-full hover:text-white `}
            >
              Jobs
            </div>
          </Link>
        </li>
        <li>
          <Link href={`/community?sortReplies=least&page=1&limit=10`}>
            <div
              className={`inline-flex items-center px-4 py-3 ${
                params?.sortReplies === "least"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-900"
              } rounded-lg hover:bg-blue-600 w-full hover:text-white `}
            >
              Least replies
            </div>
          </Link>
        </li>
        <li>
          <Link href={`/community?sortReplies=most&page=1&limit=10`}>
            <div
              className={`inline-flex items-center px-4 py-3 ${
                params?.sortReplies === "most"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-900"
              } rounded-lg hover:bg-blue-600 w-full hover:text-white `}
            >
              Most replies
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default LeftFilter;
