"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
import axios from "axios";
import { Loader2, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApiClient } from "@/hooks/useApiClient";

function ThreadMenuAction({ threadID, authorID, usage }: any) {
  const {  userData, contactData }: any = useAuthContext();
  const {privateApi} = useApiClient()
  const router = useRouter()
  // State for controlling dialogs and deletion status
  const [isEditOpen, setEditOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Open and close handlers for dialogs
  const openEditDialog = () => setEditOpen(true);
  const openDeleteDialog = () => setDeleteOpen(true);
  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setDeleteError("");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const payload = {
        userID: userData.userID,
      };
      const response = await privateApi.post(`/api/v1/forum/delete-thread/${threadID}`,
        payload
      );
      // TODO: Update your UI accordingly after deletion
      closeDeleteDialog();
      router.push('/community')
    } catch (error) {
      console.error("Deletion error:", error);
      setDeleteError("Failed to delete the thread. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {contactData && contactData.userID === authorID && (
        <Menubar className="border-none">
          <MenubarMenu>
            <MenubarTrigger className="border-none p-2">
              <Ellipsis />
            </MenubarTrigger>
            <MenubarContent>
              <div className="py-2">
                <Link href={`/community/discussions/${threadID}/update`}>
                  <MenubarItem onClick={openEditDialog}>
                    <p className="text-gray-800 antialiased">Edit</p>
                  </MenubarItem>
                </Link>
                <MenubarItem onClick={openDeleteDialog}>
                  <p className="text-red-700 antialiased">Delete</p>
                </MenubarItem>
              </div>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => !open && closeDeleteDialog()}
      >
        <DialogContent>
          <DialogDescription>
            Are you sure you want to delete this thread?
          </DialogDescription>
          {deleteError && (
            <p className="text-red-500 text-sm mt-2">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={closeDeleteDialog}
              className="py-0 m-0"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDelete}
              className="py-1 px-6"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Thread
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ThreadMenuAction;
