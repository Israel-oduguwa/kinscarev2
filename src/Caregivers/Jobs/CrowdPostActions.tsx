"use client";
import React, { useContext, useState } from "react";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Trash2Icon } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast"; // For notifications
import { useRouter } from "next/navigation";

interface CrowdPostActionsProps {
  jobID: string;
}

const CrowdPostActions: React.FC<CrowdPostActionsProps> = ({ jobID }) => {
  const mongo: any = useContext(MongoContext);
  const { user, userData } = mongo;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter()
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `https://api.kinscare.org/api/v1/providers/job/delete/${jobID}`
      );
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Job post has been successfully deleted.",
        });
        // Optionally: Add logic to remove the deleted job from UI or navigate away
        router.push("/provider/job/all")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete the job post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDialog(false); // Close the dialog after the action is completed
    }
  };

  return (
    <div className="flex space-x-2">
      {/* /provider/job/update/${jobID} */}
      {/* <Link href={``}>
        <Button className="flex gap-1" disabled>
          <Pencil size={14} /> Claim Ownership
        </Button>
      </Link> */}
  
      {/* Delete Button */}
      <Button variant="outline" size="icon" onClick={() => setShowDialog(true)}>
        <Trash2Icon size={20} />
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job post? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrowdPostActions;
