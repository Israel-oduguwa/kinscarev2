"use client";
import * as Realm from "realm-web";
import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Menu,
  LogOut,
  User,
  FileText,
  Settings,
  MessageCircle,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import MongoContext from "@/app/MongoContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CaregiverNotification from "./CaregiverNotification";
import { useRouter } from "next/navigation";
import ProfileAvatar from "@/components/ProfileAvatar";
import TagManager from "react-gtm-module";

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

const UserAvatar = ({ userData, customData, user, LogOutUser }: any) => {
  // console.log(customData);
  const userImg =
    "https://cdn.dribbble.com/users/7083770/avatars/normal/3d8dff526cb837d420cd4ae1fb73db01.png?1723696294";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 relative rounded-full">
          <div className="border border-blue-200 rounded-full">
            {/* <Avatar className="h-10 w-10 ">
              <AvatarImage
                src={
                  userData.profileImage ||
                  "https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                }
                alt={customData.name}
              />
              <AvatarFallback>
                {customData.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar> */}
            <ProfileAvatar
              size="w-10 h-10"
              name={`${
                userData?.lname
                  ? `${userData.fname} ${userData?.lname}`
                  : userData?.auth?.email
              }`}
              profileImage={userData?.profileImage}
            />
          </div>

          {/* <span className="absolute top-0 right-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-72 backdrop:bg-black/50 backdrop:backdrop-blur-md"
      >
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex justify-center flex-shrink-1 space-x-2 py-3">
            {/* <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  userData.profileImage ||
                  "https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                }
                alt={customData.name}
              />
              <AvatarFallback>
                {customData.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar> */}
            <ProfileAvatar
              size="w-12 h-12 "
              name={`${
                userData && userData.lname
                  ? `${userData.fname} ${userData.lname}`
                  : userData?.auth?.email
              }`}
              profileImage={userData?.profileImage}
            />
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-semibold antialiased">
              {userData && userData.lname ? (
                <>
                  {userData.fname} {userData.lname}
                </>
              ) : (
                <>{userData?.auth?.email}</>
              )}
            </p>
            <p className="text-xs text-gray-500 antialiased">Caregiver</p>
          </div>
          {/* <p>{userData && userData.auth.email}</p> */}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Menu Links */}
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/vitae/applied-jobs">
            <User className="mr-2 h-4 w-4" />
            Applied Jobs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/vitae/favorites">
            <Bookmark className="mr-2 h-4 w-4" />
            Saved Jobs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/vitae/update">
            <FileText className="mr-2 h-4 w-4" />
            Update Resume
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/community">
            <MessageCircle className="mr-2 h-4 w-4" />
            Community
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/your-resume">
            <FileText className="mr-2 h-4 w-4" />
            Your Resume
          </Link>
        </DropdownMenuItem> */}
        {/* <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/account-settings">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Link>
        </DropdownMenuItem> */}

        {/* Logout */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-4 border border-gray-50" asChild>
          <button className="w-full" onClick={LogOutUser}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function CaregiverNavbarRight() {
  const mongodb: any = useContext(MongoContext);
  const {
    user,
    userData,
    app,
    setUser,
    setClient,
    setLoadingAuth,
    setUserData,
    customData,
  } = mongodb;
  const router = useRouter();
  console.log(user);
  const LogOutUser = async () => {
    try {
      if (!user || !app?.currentUser) return;

      const tagManagerArgs = {
        dataLayer: {
          event: `sign_out`,
          date_time: new Date().toISOString(),
          settings: userData?.settings,
          lname: userData?.lname,
          fname: userData?.fname,
          email: userData?.auth?.email,
        },
      };
      // const payload = {
      //   added: new Date(),
      //   date_time: new Date().toISOString(),
      //   role: customData.role,
      //   userId: `${user?.id}`,
      // };

      // trackEvents(user?.customData?.hash, "Sign Out", payload);
      TagManager.dataLayer(tagManagerArgs);
      await app?.currentUser?.logOut();
      // localStorage.clear();
      console.log("logout");
      const anonymousUser = await app?.logIn(Realm.Credentials.anonymous());
      setUser(anonymousUser);
      router.push("/signin");
      setClient(app?.currentUser?.mongoClient("mongodb-atlas"));
      setLoadingAuth(false);
      setUserData({});
    } catch (error) {
      console.error("An error occurred during logout:", error);
      // Handle the error according to your application's needs
    }
  };
  // User Avatar and Dropdown
  console.log(userData);
  return (
    <div className="flex items-center px-2">
      {user && userData && customData && customData.userID ? (
        <>
          <CaregiverNotification />{" "}
          <UserAvatar
            LogOutUser={LogOutUser}
            user={user}
            customData={customData}
            userData={userData}
          />
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

export default CaregiverNavbarRight;
