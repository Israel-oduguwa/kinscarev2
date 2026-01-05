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
import FeedbackDialog from "@/CustomerFeeback/FeedbackDialog";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  BookmarkCheck,
  FileText,
  Menu,
  MessageCircle,
  SearchIcon,
  Settings,
  User
} from "lucide-react";
import Link from "next/link";
import ProviderNotification from "./ProviderNotification";

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

interface ProviderUserButtonProps {
  userData: any;
  user: any;
  LogOutUser: () => Promise<void>;
}

const ProviderUserButton = () => {
  return (
    <div className="flex items-center gap-3">
      <UserButton
        showName={false}
        afterSignOutUrl="/signin"
        appearance={{
          elements: {
            avatarBox:
              "h-10 w-10 md:h-10 md:w-10 border border-blue-200 rounded-full overflow-hidden",
            userButtonPopoverCard:
            "w-72 lg:w-96 rounded-2xl shadow-lg border border-slate-100",
            userButtonPopoverMain: "p-3 space-y-1",
          },
        }}
      >
        <UserButton.MenuItems>
          {/* Navigation links (your old dropdown items) */}
          <UserButton.Link
            label="Post a job"
            labelIcon={<FileText className="h-4 w-4" />}
            href="/provider/job/update/new"
          />
          <UserButton.Link
            label="Find caregivers"
            labelIcon={<SearchIcon className="h-4 w-4" />}
            href="/provider/candidates/all"
          />
           <UserButton.Link
            label="Conversations"
            labelIcon={<MessageCircle className="h-4 w-4" />}
            href="/provider/conversations"
          />
          <UserButton.Link
            label="Your Job postings"
            labelIcon={<User className="h-4 w-4" />}
            href="/provider/job/all"
          />
          <UserButton.Link
            label="Saved candidates"
            labelIcon={<BookmarkCheck className="h-4 w-4" />}
            href="/provider/candidates/favorites"
          />
          <UserButton.Link
            label="Update profile"
            labelIcon={<FileText className="h-4 w-4" />}
            href="/provider/account/settings/profile"
          />
          <UserButton.Link
            label="Account settings"
            labelIcon={<Settings className="h-4 w-4" />}
            href="/provider/account/settings"
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
};

function ProviderNavbarRight() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {isSignedIn ? (
        <>
          <div>
            <FeedbackDialog />
          </div>
          <ProviderNotification />
          <ProviderUserButton />
        </>
      ) : (
        <>
          <Button className="mr-2 py-2.5 font-semibold" variant="ghost">
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button className="py-2.5">
            <Link className="text-sm font-bold" href="/signup">
              Get started
            </Link>
          </Button>
        </>
      )}
      {/* <div className="lg:hidden flex items-center">
        <SheetDemo />
      </div> */}
    </div>
  );
}

export default ProviderNavbarRight;
