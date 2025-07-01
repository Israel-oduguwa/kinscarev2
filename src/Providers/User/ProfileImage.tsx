"use client";
import MongoContext from "@/app/MongoContext";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useContext } from "react";

function ProfileImage({ className }: any) {
  const mongo: any = useContext(MongoContext);
  const { userData } = mongo;
  return (
    <>
      {userData ? (
        <>
          {" "}
          {/* <Avatar className={className}>
            <AvatarImage
              src={`${userData.profileImage ? userData.profileImage : "https://a5.behance.net/764460be3afce7dd7d790eea8860d6cdc6412048/img/profile/no-image-230.png?cb=264615658"}`}
              alt="avatar-image"
            />
            <AvatarFallback>{userData.name}</AvatarFallback>
          </Avatar> */}
         <div>
            <ProfileAvatar size="w-12 h-12"  name={userData?.name} profileImage={userData?.profileImage}/>
         </div>
        </>
      ) : (
        <>
          {" "}
          <Avatar className={className}>
            <AvatarImage src="" alt="avatar-image" />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        </>
      )}
    </>
  );
}

export default ProfileImage;
