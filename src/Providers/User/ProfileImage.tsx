"use client";
import { UserButton } from "@clerk/nextjs";

function ProfileImage({ className }: any) {
  return (
    <>
      <UserButton {...className} />
    </>
  );
}

export default ProfileImage;
