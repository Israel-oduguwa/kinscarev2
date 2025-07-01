"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MongoContext from "@/app/MongoContext";
import { WhatsappIcon, WhatsappShareButton } from "next-share";

interface ReferCaregiverDialogProps {
  jobID: string;
  title: string;
  newJobID: string;
  referral: string;
  claimed: boolean;
}

export function ReferCaregiverDialog({
  jobID,
  title,
  referral,
  claimed,
  newJobID,
}: ReferCaregiverDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { userData }: any = useContext(MongoContext);
  const [success, setSuccess] = useState("");
  console.log(newJobID);

  useEffect(() => {
    const setPersonalMessage = () => {
      const personalNotePlaceHolder: string = `I thought of you for this opportunity because you truly care about making a difference. This job could be a great next step for you—if you’re interested, I’d love to see you apply!`;
      setMessage(personalNotePlaceHolder);
    };
    setPersonalMessage();
  }, [name]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        jobID: referral === "complete" ? newJobID : jobID,
        recipientName: name,
        senderName: `${userData.fname} ${userData.lname}`,
        to: email,
        referral,
        message,
        title,
      };
      const res = await axios.post(
        "https://api.kinscare.org/api/v1/email/referred-customer-signup",
        payload
      );
      if (res.status === 200 || res.status === 201) {
        setSuccess("Referral sent successfully!");
        // Wait a short moment before closing so user sees the success state
        setTimeout(() => {
          setOpen(false);
          setSuccess("");
        }, 1200);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Could not send referral. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const referralLink =
    referral === "complete"
      ? `https://kinscare.org/jobs/${jobID}`
      : `https://kinscare.org/crowd-post/apply/${jobID}`;

  const shareText =
    "I found this caregiving opportunity and thought it might be a great fit for you. Check it out and apply directly on KinsCare!";

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-gray-900">
        Know Someone Who Shouldn’t Miss This?
      </h2>
      <p className="mb-3 text-slate-800">
        Know a caregiver who deserves a great opportunity? Refer them below or
        share this job instantly on WhatsApp and help them take the next step in
        their career—your recommendation could change someone’s life and
        strengthen our trusted caregiving community.
      </p>
      <div className="flex gap-3 mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-xl" variant="default">
              Refer a Caregiver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Refer a Caregiver</DialogTitle>
              <DialogDescription>
                By inviting caregivers to apply for this job, you help care
                providers fill open positions quickly while supporting
                caregivers looking for new opportunities.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm py-1 font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm py-1 font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm py-1 font-medium text-gray-700">
                    Personal Note
                  </label>
                  <textarea
                    className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-vertical min-h-[80px] max-h-[220px] bg-gray-50"
                    placeholder="Add a personal note (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    rows={8}
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 rounded p-2">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-700 bg-green-50 rounded p-2 text-center">
                    {success}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!name || !email || loading || !!success}
                >
                  {loading ? "Sending..." : "Send Referral"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <WhatsappShareButton
          url={referralLink}
          title={shareText}
          separator=" "
          // className="flex p-4 shadow-xl"
        >
          <span className="flex items-center">
            <WhatsappIcon size={40} round />
            <span className="ml-2 text-sm font-semibold text-green-600 hidden md:inline">
              Share via WhatsApp
            </span>
          </span>
        </WhatsappShareButton>
      </div>
    </div>
  );
}
