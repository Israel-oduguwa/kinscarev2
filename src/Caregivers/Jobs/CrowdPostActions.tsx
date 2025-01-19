"use client";
import React, { use, useContext, useEffect, useState } from "react";
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
  isProvider: boolean;
  employerEmail: string;
}

const CrowdPostActions: React.FC<CrowdPostActionsProps> = ({ jobID,isProvider,employerEmail }) => {
  const mongo: any = useContext(MongoContext);
  const { user, userData } = mongo;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter()
  const handleClaimTransfer = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://api.kinscare.org/api/v1/providers/crowd-post/transfer/${jobID}`
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Ownership transferred has been successfully.",
        });
        // Optionally: Add logic to remove the deleted job from UI or navigate away
        router.push("/provider/job/all")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to transfer the ownership. Please try again. ${err}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDialog(false); // Close the dialog after the action is completed
    }
  };

  useEffect(()=>{
    setCurrentUserEmail(user?.customData?.email)
    console.log(`user=== ${(user?.customData?.email)}`)
  },[1])

  return (
    <div className="flex space-x-2">
      {/* /provider/job/update/${jobID} */}
      {employerEmail == currentUserEmail && ( <Link href={``}>
        <Button className="flex gap-1" onClick={() => setShowDialog(true)}>
          <Pencil size={14} /> Claim Ownership
        </Button>
      </Link> )}
  
      {/* Delete Button */}
      {/* <Button variant="outline" size="icon" onClick={() => setShowDialog(true)}>
        <Trash2Icon size={20} />
      </Button> */}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Job Opening</DialogTitle>
            <DialogDescription>
            Update and finalize this post to access the list of applicants and keep referrers like engaged in sharing future openings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline"  onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleClaimTransfer}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrowdPostActions;
