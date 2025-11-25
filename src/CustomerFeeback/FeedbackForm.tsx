"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useApiClient } from "@/hooks/useApiClient";

type FeedbackFormProps = {
  onSubmit?: (data: {
    email: string;
    subject: string;
    message: string;
  }) => void;
};

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { privateApi } = useApiClient();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Trigger the parent `onSubmit` if provided
    if (onSubmit) {
      onSubmit(formData);
    }

    try {
      // Use Axios to send the POST request to your API
      const response = await privateApi.post(
        "/api/v1/email/customer_feedback",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Feedback Sent!",
          description: "Your feedback has been successfully submitted.",
        });
        setFormData({ email: "", subject: "", message: "" }); // Reset form
      } else {
        throw new Error("Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Failed to Send Feedback",
        description:
          "There was an error submitting your feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="mb-0.5 text-gray-800 font-semibold">Contact Support</h2>
        <p className="mb-2 text-sm text-gray-700">
          Let us know how we can assist you. Fill out the form below to send us
          a message.
        </p>
      </div>
      <div>
        <Label htmlFor="email">Your Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="name@domain.com"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          type="text"
          name="subject"
          placeholder="What can we help you with?"
          value={formData.subject}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="message">Your Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Let us know how we can assist you..."
          value={formData.message}
          onChange={handleInputChange}
          rows={4}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
