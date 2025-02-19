"use client";

import React, { useContext, useEffect } from "react";
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
  BadgeHelp,
  BookmarkCheck,
} from "lucide-react";
import Link from "next/link";
import MongoContext from "@/app/MongoContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProviderNotification from "./ProviderNotification";
import ProviderLogout from "./User/ProviderLogout";
import ProfileAvatar from "@/components/ProfileAvatar";
import * as Realm from "realm-web";
import { useRouter } from "next/navigation";
import FeedbackDialog from "@/CustomerFeeback/FeedbackDialog";

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

const UserAvatar = ({ userData, user, LogOutUser }: any) => {
  console.log(user.customData, "this sef");
  console.log(userData)
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
                alt={user?.customData?.name}
              />
              <AvatarFallback>
                {user?.customData?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar> */}
             <ProfileAvatar size="w-12 h-12"  name={user?.customData?.email} profileImage={userData?.profileImage}/>
          </div>

          {/* <span className="absolute top-0 right-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-80">
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex flex-col items-center space-x-2 py-3">
          <ProfileAvatar size="w-12 h-12"  name={user?.customData?.email} profileImage={userData?.profileImage}/>
            {/* <Avatar className="h-20 w-20">
              <AvatarImage
                src={
                  userData?.profileImage ||
                  "https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                }
                alt={user?.customData?.name}
              />
              <AvatarFallback>
                {user?.customData?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar> */}
            <div className="flex flex-col items-center text-center">
              <p className="font-semibold text-lg antialiased">
                {userData?.fname} {userData?.lname}
              </p>
              <p className="text-sm font-normal text-gray-600 text-center antialiased">
                {user.customData.hr_email
                  ? user.customData.hr_email
                  : user.customData.email}
              </p>
            </div>
          </div>
          {/* <p>{userData && userData.auth.email}</p> */}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="border border-zinc-100" />

        {/* Menu Links */}
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/provider/job/update/new">
            <FileText className="mr-2 h-4 w-4 text-sm text-zinc-900 " />
            <p className="text-sm  text-zinc-900"> Post a job</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/provider/job/all">
            <User className="mr-2 h-4 w-4" />
            <p className="font-normal">Your Job postings</p>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/provider/candidates/favorites">
            <BookmarkCheck className="mr-2 h-4 w-4" />
            Saved Candidates
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/provider/account/settings/profile">
            <FileText className="mr-2 h-4 w-4" />
            Update Profile
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/conversations">
            <MessageCircle className="mr-2 h-4 w-4" />
            Conversations
          </Link>
        </DropdownMenuItem> */}
        <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/provider/account/settings">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="p-3 border border-gray-50" asChild>
          <Link href="/account-settings">
            <BadgeHelp className="mr-2 h-4 w-4" />
            Help
          </Link>
        </DropdownMenuItem> */}

        {/* Logout */}
        <DropdownMenuSeparator />
        <ProviderLogout>
          <DropdownMenuItem
            className="p-4 border w-full border-gray-50"
            asChild
          >
           <button
            className="w-full"
            onClick={LogOutUser}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
          </DropdownMenuItem>
        </ProviderLogout>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function ProviderNavbarRight() {
  const mongodb: any = useContext(MongoContext);
  const router = useRouter()
  const { user, userData,setUser, setClient, setLoadingAuth, setUserData, app } = mongodb;
  useEffect(() => {
    if(user){
      user.refreshCustomData();
    }
  }, [user]);

  // User Avatar and Dropdown
  const LogOutUser = async () => {
    try {
      if (!user || !app?.currentUser) return;
      setLoadingAuth(true)

      // const tagManagerArgs = {
      //   dataLayer: {
      //     event: "sign_out",
      //     added: new Date(),
      //     date_time: new Date().toISOString(),
      //     distinct_id: user?.customData?.hash,
      //     role: user?.customData?.role,
      //     userId: `${user?.id}`,
      //   },
      // };
      // const payload = {
      //   added: new Date(),
      //   date_time: new Date().toISOString(),
      //   role: user?.customData?.role,
      //   userId: `${user?.id}`,
      // };

      // trackEvents(user?.customData?.hash, "Sign Out", payload);
      // TagManager.dataLayer(tagManagerArgs);

      await app?.currentUser?.logOut();
      // localStorage.clear();
      console.log("logout")
      router.push("/signin");
      const anonymousUser = await app?.logIn(Realm.Credentials.anonymous());
      
      setUser(anonymousUser);
      // localStorage.clear()
      
      setClient(app?.currentUser?.mongoClient("mongodb-atlas"));
      
      setUserData({});
      await setLoadingAuth(false);
    } catch (error) {
      console.error("An error occurred during logout:", error);
      // Handle the error according to your application's needs
    }
  };
  return (
    <div className="flex items-center">
      {user && userData ? (
        <>
          <div><FeedbackDialog/></div>
          <ProviderNotification />{" "}
          {user && <UserAvatar LogOutUser={LogOutUser} user={user} userData={userData} />}
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
