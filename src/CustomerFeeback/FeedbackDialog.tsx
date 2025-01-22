"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FeedbackForm from "./FeedbackForm";
import { Mail } from "lucide-react";

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
         <Mail/> <span className="hidden md:block">Contact Support</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        
        <FeedbackForm
          onSubmit={(data) => {
            console.log("Feedback submitted:", data);
            setIsOpen(false); // Close dialog after submission
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
