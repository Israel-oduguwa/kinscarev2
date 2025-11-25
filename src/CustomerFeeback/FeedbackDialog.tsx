"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FeedbackForm from "./FeedbackForm";
import { Mail, MessageCircle } from "lucide-react";

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenHiringChat = () => {
    if (typeof window !== "undefined" && window.Intercom) {
      // 1. Set custom attributes (for hiring context)
      window.Intercom("update", {
        custom_attributes: {
          section: "contact-support",
          conversation_source: "contact-support-chat",
        },
      });
      // 2. Open chat with pre-filled message
      window.Intercom("showNewMessage", "Hi, I need help hiring a caregiver.");
    } else {
      alert("Chat is loading. Please try again in a moment!");
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenHiringChat}
        variant="outline"
        className="text-sm"
      >
        <MessageCircle />
        <span className="hidden md:block">Contact Support</span>
      </Button>
    </>
    // <Dialog open={isOpen} onOpenChange={setIsOpen}>
    //   <DialogTrigger asChild>
    //     <Button variant="outline" className="text-sm">
    //      <Mail/> <span className="hidden md:block">Contact Support</span>
    //     </Button>
    //   </DialogTrigger>
    //   <DialogContent className="sm:max-w-lg">

    //     <FeedbackForm
    //       onSubmit={(data) => {
    //         console.log("Feedback submitted:", data);
    //         setIsOpen(false); // Close dialog after submission
    //       }}
    //     />
    //   </DialogContent>
    // </Dialog>
  );
}
