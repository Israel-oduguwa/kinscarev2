"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SignIn } from "@clerk/nextjs";

interface SigninModalProps {
  children: React.ReactNode;
  role?: "caregiver" | "provider"; // optional default
}

export default function SigninModal({ children, role }: SigninModalProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"caregiver" | "provider">(
    role || "caregiver"
  );

  const afterSignInUrl =
    selectedRole === "caregiver"
      ? "/vitae/jobs/all"
      : "/provider/candidates/all";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="rounded-xl bg-white max-w-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign in to Kinscare</h1>

        <p className="text-gray-600 text-center text-sm">
          Choose your account type to continue
        </p>

        {/* Role selector (radio buttons) */}
        <RadioGroup
          value={selectedRole}
          onValueChange={(value) =>
            setSelectedRole(value as "caregiver" | "provider")
          }
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
            <RadioGroupItem value="caregiver" id="caregiver" />
            <Label htmlFor="caregiver" className="cursor-pointer">
              I am a{" "}
              <span className="font-semibold">Caregiver</span> looking for a job
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
            <RadioGroupItem value="provider" id="provider" />
            <Label htmlFor="provider" className="cursor-pointer">
              I am a{" "}
              <span className="font-semibold">Provider</span> searching for
              caregivers / NACs
            </Label>
          </div>
        </RadioGroup>

        {/* Clerk SignIn component */}
        <div className="mt-2">
          <SignIn
            afterSignInUrl={afterSignInUrl}
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-blue-600 shadow-md border-none hover:bg-blue-500",
                card: "border-gray-200 gap-3",
                rootBox: "flex justify-center w-full px-0",
                main: "gap-3",
                cardBox:
                  "w-full max-w-md bg-white shadow-xl rounded-2xl border border-gray-100 transition-all",
              },
            }}
          />
        </div>

        {/* Optional close button if you want it */}
        <Button
          variant="ghost"
          className="w-full mt-2"
          onClick={() => setIsDialogOpen(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
