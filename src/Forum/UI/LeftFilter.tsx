import Link from "next/link";
import React from "react";
import { HelpCircle, SortAsc, SortDesc } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { UrlObject } from "url";

function FiltersWithMore({ params }: any) {
  const filters = [
    {
      label: "Newest and Recent",
      description: "Find the latest updates",
      href: `/community?sort=newest&page=1&limit=10`,
      active: params?.sort === "newest",
    },
    {
      label: "Most Replies",
      description: "Sort by most replies",
      href: `/community?sortReplies=most&page=1&limit=10`,
      active: params?.sortReplies === "most",
    },
    {
      label: "Least Replies",
      description: "Sort by least replies",
      href: `/community?sortReplies=least&page=1&limit=10`,
      active: params?.sortReplies === "least",
    },
    {
      label: "Popular Tags",
      description: "See trending tags",
      href: `/community?tags=popular&page=1&limit=10`,
    },
    {
      label: "Questions",
      href: `/community?category=Questions&page=1&limit=10`,
    },
    {
      label: "Physician Assistant",
      href: `/community?category=Physician Assistant&page=1&limit=10`,
    },
    {
      label: "RN program",
      href: `/community?category=RN program&page=1&limit=10`,
    },
    {
      label: "LPN program",
      href: `/community?category=LPN program&page=1&limit=10`,
    },
    { label: "Nurse", href: `/community?category=Nurse&page=1&limit=10` },
  ];
  

  const filtersDesktop = [
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


  return (
    <div className="bg-white  rounded-lg border border-gray-50 p-4">
      {/* Filter UI mobile */}
      <div className="flex items-center xl:hidden flex-col justify-between gap-4">
        {/* Primary Filters */}
        <div className="flex gap-3 w-full">
          {filters.slice(0, 2).map((filter) => (
            <Link key={filter.label} href={filter.href}>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-colors ${
                  filter.active
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            </Link>
          ))}
        </div>

        {/* More Filters Button */}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="px-6 w-full  py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition-transform transform hover:scale-105">
              More Filters
            </button>
          </DrawerTrigger>
          <DrawerContent className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Filters
            </h2>
            {/* Full Filters List */}
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
                      <p className="font-semibold text-gray-800 text-sm">
                        {filter.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {filter.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <DrawerClose asChild>
              <button className="mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">
                Close
              </button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="hidden xl:block">
      <div>
        <ul className="space-y-4">
          {filtersDesktop.map((filter) => (
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
          {tags.map((tag: { label: boolean | React.Key | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; href: string | UrlObject; }) => (
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
    </div>
  );
}

export default FiltersWithMore;
