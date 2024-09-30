"use client";
import React, { useState } from "react";
import QuoteButton from "./OuoteButton";
import MongoContext from "@/app/MongoContext";
import { useContext } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import UpdatePost from "./UpdateForum/UpdatePost";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Ellipsis } from "lucide-react";
import DialogWrapper from "@/components/DialogWrapper";
import DeletePost from "./UpdateForum/DeletePost";
import Link from "next/link";
import axios from "axios";
function ThreadMenuAction({ threadID, authorID }: any) {
  const mongodb = useContext(MongoContext);
  const { user }: any = mongodb;
  // State for controlling dialogs
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);

  // Open and close handlers for dialogs
  const openEditDialog = () => setEditOpen(true);
  const closeEditDialog = () => setEditOpen(false);
const del = async () => {
    const del = await axios.post(`https://api.kinscare.org/api/v1/forum/threads/${threadID}`)
    // console.log(del)
}
  const openDeleteDialog = () => setDeleteOpen(true);
  const closeDeleteDialog = () => setDeleteOpen(false);

  const openReportDialog = () => setReportOpen(true);
  const closeReportDialog = () => setReportOpen(false);

  // console.log(user.customData.userID);
  // when editing open a modal
  return (
    <>
      <Menubar className="border-none">
        <MenubarMenu>
          <MenubarTrigger className="border-none p-2">
            <Ellipsis />
          </MenubarTrigger>
          <MenubarContent> 
            <MenubarItem>
              <p className="text-gray-800 antialiased">Share Link</p>
            </MenubarItem>
          
            <div className="py-2">
              {user && user.customData.userID === authorID ? (
                <>
                  <MenubarSeparator className="border-gray-100 border" />

                 <Link href={`/community/discussions/${threadID}/update`}>
                 <MenubarItem onClick={openEditDialog}>
                    <p className="text-gray-800 antialiased">Edit</p>
                  </MenubarItem>
                  </Link>


                </>
              ) : (
                <>
                  <MenubarSeparator />
                  <MenubarItem onClick={openReportDialog}>
                    <p className="text-gray-800 antialiased">Report Content</p>
                  </MenubarItem>
                </>
              )}
              {/* <MenubarItem onClick={del}>
                    <p className="text-red-700 antialiased">Delete</p>
                  </MenubarItem> */}
            </div>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* <DialogWrapper
        width="sm:max-w-[400px]"
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
      
      >
        <DeletePost
          close={closeDeleteDialog}
          usage={usage}
          // content={content}
          postID={usage === "comments" ? replyID : postID}
        />
      </DialogWrapper> */}

      {/* <DialogWrapper
        isOpen={isReportOpen}
        onClose={closeReportDialog}
        dialogTitle="Report Post"
      >
        <ReportPost postID={postID} />
      </DialogWrapper> */}
    </>
  );
}

export default ThreadMenuAction;
