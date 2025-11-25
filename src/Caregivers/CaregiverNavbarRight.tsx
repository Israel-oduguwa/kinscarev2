"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BookCopy,
  Bookmark,
  BriefcaseBusiness,
  DotIcon,
  FileText,
  Menu,
  MessageCircle,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import CaregiverNotification from "./CaregiverNotification";

function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
          <Menu />
        </div>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// All menu items are now inside the Clerk UserButton
function CaregiverUserButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          // Slightly larger avatar, with subtle border
          avatarBox:
            "h-10 w-10 md:h-11 md:w-11 border border-blue-200 rounded-full",
          // Make the menu a bit wider & nicer
          userButtonPopoverCard:
            "w-72 lg:w-96 rounded-2xl shadow-lg border border-slate-100",
        },
      }}
    >
      <UserButton.MenuItems>
        {/* Your navigation links */}
        <UserButton.Link
          label="Find jobs"
          labelIcon={<SearchIcon className="h-4 w-4" />}
          href="/vitae/jobs/all"
        />
        <UserButton.Link
          label="Applied jobs"
          labelIcon={<FileText className="h-4 w-4" />}
          href="/vitae/applied-jobs"
        />
        <UserButton.Link
          label="Saved jobs"
          labelIcon={<Bookmark className="h-4 w-4" />}
          href="/vitae/favorites"
        />
        <UserButton.Link
          label="Career plan"
          labelIcon={<BookCopy className="h-4 w-4" />}
          href="/vitae/career-plan"
        />
        <UserButton.Link
          label="Refer + Make $"
          labelIcon={<BriefcaseBusiness className="h-4 w-4" />}
          href="/vitae/crowd-post/update/new"
        />
        <UserButton.Link
          label="Update resume"
          labelIcon={<FileText className="h-4 w-4" />}
          href="/vitae/update"
        />
        <UserButton.Link
          label="Community"
          labelIcon={<MessageCircle className="h-4 w-4" />}
          href="/community"
        />

        {/* Default Clerk items (Manage account, Sign out) stay at the bottom automatically */}
      </UserButton.MenuItems>
    </UserButton>
  );
}

function CaregiverNavbarRight() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center px-2 gap-2">
      {isSignedIn ? (
        <>
          {/* User avatar + menu (Clerk) */}
          <CaregiverNotification/>
          <CaregiverUserButton />
        </>
      ) : (
        <>
          <Button className="mr-1 py-2.5 font-semibold" variant="ghost" asChild>
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button className="py-2.5" asChild>
            <Link className="text-sm font-bold" href="/signup">
              Get started
            </Link>
          </Button>
        </>
      )}

      {/* Optional mobile sheet (kept, but you can hook it up when needed) */}
      {/* <div className="lg:hidden flex items-center">
        <SheetDemo />
      </div> */}
    </div>
  );
}

export default CaregiverNavbarRight;
