import Link from "next/link";
import React from "react";
import {
  HelpCircle,
  School,
  Briefcase,
  ListChecks,
  SortAsc,
  SortDesc,
} from "lucide-react";

function LeftFilter({ params }: any) {
  const filters = [
    {
      label: "Newest and Recent",
      description: "Find the latest updates",
      icon: <HelpCircle className="text-blue-500 w-5 h-5" />,
      href: `/community?sort=newest&page=1&limit=10`,
      active: params?.sort === "newest",
    },

    {
      label: "Most Replies",
      icon: (
        <div className="p-2 mr-3 rounded-md bg-purple-100">
          <SortDesc className="text-purple-600 shrink-0" />
        </div>
      ),
      description: "most replies",
      href: `/community?sortReplies=most&page=1&limit=10`,
      active: params?.sortReplies === "most",
    },
    {
      label: "Least Replies",
      icon: <SortAsc className="mr-3 text-purple-600" />,
      href: `/community?sortReplies=least&page=1&limit=10`,
      description: "Least replies",
      active: params?.sortReplies === "least",
    },
  ];

  const tags = [
    {
      label: "Questions",
      href: `/community?category=Questions&page=1&limit=10`,
      active: params?.category === "Questions",
    },
    {
      label: "Physician Assistant",
      href: `/community?category=Physician Assistant&page=1&limit=10`,
      active: params?.category === "Physician Assistant",
    },
    {
      label: "RN program",
      href: `/community?category=RN program&page=1&limit=10`,
      active: params?.category === "RN program",
    },
    {
      label: "LPN program",
      href: `/community?category=LPN program&page=1&limit=10`,
      active: params?.category === "LPN program",
    },
    {
      label: "Nurse",
      href: `/community?category=Nurse&page=1&limit=10`,
      active: params?.category === "Nurse",
    },
  ];

  const pinnedGroups = [
    { label: "#javascript", count: "82,645" },
    { label: "#bitcoin", count: "65,523", trending: true },
    { label: "#design", count: "51,354", location: "Trending in Bangladesh" },
    { label: "#blogging", count: "48,029" },
    { label: "#tutorial", count: "51,354" },
  ];

  return (
    <div className="sticky top-10 space-y-6 bg-white shadow-sm rounded-lg p-4 border border-gray-200">
      {/* Filters */}
      <div>
        <ul className="space-y-4">
          {filters.map((filter) => (
            <li key={filter.label}>
              <Link href={filter.href}>
                <div
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    filter.active
                      ? "bg-gray-100 border border-gray-200 hover:bg-gray-200"
                      : "bg-white"
                  }`}
                >
                  {/* {filter.icon} */}
                  <div>
                    <p className="font-semibold antialiased text-gray-800 text-sm">
                      # {filter.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {filter.description}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Popular Tags
        </h2>
        <ul className="space-y-3">
          {tags.map((tag) => (
            <Link
              key={tag.label}
              className="flex items-center  p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              href={tag.href}
            >
              <li className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-500 flex items-center justify-center rounded-lg font-bold text-sm">
                  #
                </div>
                <div>
                  <p className="text-sm font-medium">{tag.label}</p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LeftFilter;

// Popular Tags

// {/* Pinned Groups */}
// <div>
//   <h2 className="text-lg font-semibold text-gray-800 mb-4">
//     Pinned Groups
//   </h2>
//   <ul className="space-y-3">
//     {pinnedGroups.map((group) => (
//       <li
//         key={group.label}
//         className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
//       >
//         <div className="w-8 h-8 bg-green-100 text-green-500 flex items-center justify-center rounded-lg font-bold text-sm">
//           #
//         </div>
//         <div>
//           <p className="text-sm font-medium">{group.label}</p>
//           <p className="text-xs text-gray-500">
//             {group.count} {group.trending ? "• Trending" : ""}
//             {group.location ? ` • ${group.location}` : ""}
//           </p>
//         </div>
//       </li>
//     ))}
//   </ul>
// </div>
