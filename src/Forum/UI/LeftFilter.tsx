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
      label: "Questions",
      icon: <HelpCircle className="mr-3 text-blue-600" />,
      href: `/community?category=Questions&page=1&limit=10`,
      active: params?.category === "Questions",
    },
    {
      label: "Schools",
      icon: <School className="mr-3 text-green-600" />,
      href: `/community?category=Schools&page=1&limit=10`,
      active: params?.category === "Schools",
    },
    {
      label: "Programs",
      icon: <ListChecks className="mr-3 text-yellow-600" />,
      href: `/community?category=Programs&page=1&limit=10`,
      active: params?.category === "Programs",
    },
    {
      label: "Jobs",
      icon: <Briefcase className="mr-3 text-orange-600" />,
      href: `/community?category=Jobs&page=1&limit=10`,
      active: params?.category === "Jobs",
    },
    {
      label: "Least Replies",
      icon: <SortAsc className="mr-3 text-purple-600" />,
      href: `/community?sortReplies=least&page=1&limit=10`,
      active: params?.sortReplies === "least",
    },
    {
      label: "Most Replies",
      icon: (
        <div className="p-2 mr-3 rounded-md bg-purple-100">
          <SortDesc className="text-purple-600 shrink-0" />
        </div>
      ),
      href: `/community?sortReplies=most&page=1&limit=10`,
      active: params?.sortReplies === "most",
    },
  ];

  return (
    <div className="sticky top-10 p-6 shadow-sm bg-white rounded-xl border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Filter by</h2>
      <ul className="space-y-3">
        {filters.map((filter) => (
          <li key={filter.label}>
            <Link href={filter.href}>
              <div
                className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  filter.active
                    ? "bg-blue-50 border border-blue-600 text-blue-600"
                    : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {filter.icon}
                <span className="font-medium">{filter.label}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LeftFilter;
