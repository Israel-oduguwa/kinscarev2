/* eslint-disable react-hooks/exhaustive-deps */
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
  claimed:boolean;
}

const CrowdPostActions: React.FC<CrowdPostActionsProps> = ({ jobID,isProvider,employerEmail, claimed }) => {
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
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/crowd-post/transfer/${jobID}`
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Ownership transfer successful.",
        });
        // Optionally: Add logic to remove the deleted job from UI or navigate away
        router.push(`/crowd-post/job/update/${response.data.jobId}`) 
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
    const queryParams = new URLSearchParams(window.location.search);
    // Extract the referral_code parameter
    const email:any = queryParams.get("email");
    setCurrentUserEmail(email)
  },[1])

  return (
    <div className="flex space-x-2">
      {/* /provider/job/update/${jobID} */}
      {employerEmail == currentUserEmail && ( <Link href={``}>
        <Button disabled={claimed} className="flex gap-1" onClick={() => setShowDialog(true)}>
          <Pencil size={14} /> {claimed ? "Ownership Claimed":" Claim Ownership"}
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
