"use client";
import MongoContext from "@/app/MongoContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { generateAvatarData } from "@/lib/ui_utils";
import Link from "next/link";
import React, { useContext } from "react";

function NavbarActions() {
  const mongodb = useContext(MongoContext);
  const { user, userData }: any = mongodb;
  const avatarData = generateAvatarData(`${userData?.fname} ${userData?.lname}`);
  return (
    <>
      {user && userData && user.customData ? (
        <>
          <Avatar className="border-gray-50 shadow-sm">
            <AvatarImage src="https://lh3.googleusercontent.com/a/ACg8ocLhJ06zIepDHxUHhZ6_sW01qSutpYn8XzXPb9cbFkFOfmOdoOs=s192-c-mo" />
            <AvatarFallback
              style={{ background: avatarData.gradient }}
              className="border-gray-50"
            >
              {avatarData.initials}
            </AvatarFallback>
          </Avatar>
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
    </>
  );
}

export default NavbarActions;
