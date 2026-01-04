import Link from "next/link";
import React from "react";
import { HelpCircle, SortAsc, SortDesc, Tag, ChevronRight } from "lucide-react";
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
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
    },
    {
      label: "Most Replies",
      description: "Sort by most replies",
      href: `/community?sortReplies=most&page=1&limit=10`,
      active: params?.sortReplies === "most",
      icon: <SortDesc className="w-4 h-4 text-blue-500" />,
    },
    {
      label: "Least Replies",
      description: "Sort by least replies",
      href: `/community?sortReplies=least&page=1&limit=10`,
      active: params?.sortReplies === "least",
      icon: <SortAsc className="w-4 h-4 text-blue-500" />,
    },
    {
      label: "Popular Tags",
      description: "See trending tags",
      href: `/community?tags=popular&page=1&limit=10`,
      icon: <Tag className="w-4 h-4 text-green-500" />,
    },
    // {
    //   label: "Questions",
    //   href: `/community?category=Questions&page=1&limit=10`,
    //   active: params?.category === "Questions",
    //   icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
    // },
    // {
    //   label: "Physician Assistant",
    //   href: `/community?category=Physician Assistant&page=1&limit=10`,
    //   active: params?.category === "Physician Assistant",
    //   icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
    // },
    // {
    //   label: "RN program",
    //   href: `/community?category=RN program&page=1&limit=10`,
    //   active: params?.category === "RN program",
    //   icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
    // },
    // {
    //   label: "LPN program",
    //   href: `/community?category=LPN program&page=1&limit=10`,
    //   active: params?.category === "LPN program",
    //   icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
    // },
    // {
    //   label: "Nurse",
    //   href: `/community?category=Nurse&page=1&limit=10`,
    //   active: params?.category === "Nurse",
    //   icon: <HelpCircle className="w-4 h-4 text-blue-500" />,
    // },
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
    <div className="bg-white/80 rounded-3xl border border-white/70 p-4 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
      {/* Mobile Filters */}
      <div className="xl:hidden">
        <div className="flex gap-2 w-full mb-4">
          {filters.slice(0, 2).map((filter) => (
            <Link key={filter.label} href={filter.href}>
              <button
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  filter.active
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white/80 text-slate-800 hover:bg-slate-100 border border-white/70"
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            </Link>
          ))}
        </div>

        {/* More Filters Drawer */}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="w-full px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-[1.02]">
              More Filters
            </button>
          </DrawerTrigger>
          <DrawerContent className="p-4 bg-white rounded-t-2xl">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Filters</h2>
            <ul className="space-y-2">
              {filters.map((filter) => (
                <li key={filter.label}>
                  <Link href={filter.href}>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                        filter.active
                          ? "bg-blue-50 border border-blue-100"
                          : "bg-white/80 hover:bg-slate-50 border border-white/70"
                      }`}
                    >
                      {filter.icon}
                      <div>
                        <p className="text-xs font-medium text-slate-800">
                          {filter.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {filter.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <DrawerClose asChild>
              <button className="mt-4 w-full px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800">
                Close
              </button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Filters */}
      <div className="hidden xl:block">
        <ul className="space-y-2">
          {filters.map((filter) => (
            <li key={filter.label}>
              <Link href={filter.href}>
                <div
                  className={`flex items-start gap-2 p-2 rounded-lg transition-all ${
                    filter.active
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-white/80 hover:bg-slate-50 border border-white/70"
                  }`}
                >
                  {filter.icon}
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      {filter.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {filter.description}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Popular Tags Section */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Popular Tags
          </h2>
          <ul className="space-y-2">
            {tags.map((tag) => (
              <Link key={tag.label} href={tag.href}>
                <li
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    tag.active
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-white/80 hover:bg-slate-50 border border-white/70"
                  }`}
                >
                  <div className="w-6 h-6 bg-blue-100 text-blue-500 flex items-center justify-center rounded-lg text-xs">
                    #
                  </div>
                  <p className="text-xs font-medium text-slate-800">
                    {tag.label}
                  </p>
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
