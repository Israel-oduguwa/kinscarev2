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
      label: "Popular of the Day",
      description: "Shots featured today by curators",
      icon: <School className="text-orange-500 w-5 h-5" />,
      href: `/community?sort=popular&page=1&limit=10`,
      active: params?.sort === "popular",
    },
    {
      label: "Following",
      description: "Explore from your favorite person",
      icon: (
        <div className="relative">
          <Briefcase className="text-green-500 w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
            24
          </span>
        </div>
      ),
      href: `/community?sort=following&page=1&limit=10`,
      active: params?.sort === "following",
    },
  ];

  const tags = [
    { label: "#javascript", count: "82,645" },
    { label: "#bitcoin", count: "65,523", trending: true },
    { label: "#design", count: "51,354", location: "Trending in Bangladesh" },
    { label: "#innovation", count: "48,029" },
    { label: "#tutorial", count: "51,354" },
    { label: "#business", count: "82,645" },
  ];

  const pinnedGroups = [
    { label: "#javascript", count: "82,645" },
    { label: "#bitcoin", count: "65,523", trending: true },
    { label: "#design", count: "51,354", location: "Trending in Bangladesh" },
    { label: "#blogging", count: "48,029" },
    { label: "#tutorial", count: "51,354" },
  ];

  return (
    <div className="sticky top-10 space-y-6 bg-white shadow-sm rounded-lg p-6 border border-gray-200">
      {/* Filters */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Discover Filters
        </h2>
        <ul className="space-y-4">
          {filters.map((filter) => (
            <li key={filter.label}>
              <Link href={filter.href}>
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                    filter.active
                      ? "bg-blue-50 border border-blue-500 text-blue-600"
                      : "bg-gray-100 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {filter.icon}
                  <div>
                    <p className="font-semibold antialiased text-gray-800 text-sm">
                      {filter.label}
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
    </div>
  );
}

export default LeftFilter;

// Popular Tags
// <div>
//   <h2 className="text-lg font-semibold text-gray-800 mb-4">
//     Popular Tags
//   </h2>
//   <ul className="space-y-3">
//     {tags.map((tag) => (
//       <li
//         key={tag.label}
//         className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
//       >
//         <div className="w-8 h-8 bg-blue-100 text-blue-500 flex items-center justify-center rounded-lg font-bold text-sm">
//           #
//         </div>
//         <div>
//           <p className="text-sm font-medium">{tag.label}</p>
//           <p className="text-xs text-gray-500">
//             {tag.count} {tag.trending ? "• Trending" : ""}
//             {tag.location ? ` • ${tag.location}` : ""}
//           </p>
//         </div>
//       </li>
//     ))}
//   </ul>
// </div>

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
