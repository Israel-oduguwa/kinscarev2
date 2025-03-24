"use client";

import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackEvents } from "@/lib/utils";
import MongoContext from "@/app/MongoContext";
import * as Realm from "realm-web";
import { useRouter } from "next/navigation";
import axios from "axios";
function DeleteAccount() {
  const { userData, user, app, setUserData, setClient, setUser }: any =
    useContext(MongoContext);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleDelete = async () => {
    // Build the payload with the collected answers and info.
    try {
      setLoading(true);
      const payload = {
        reason,
        feedback,
        confirmationText,
        timestamp: new Date().toISOString(),
        licenses: userData?.licenses,
        lname: userData?.lname,
        hash: userData?.hash,
        fname: userData?.fname,
        role: userData?.role,
        email: userData?.email,
        zipcode: userData?.zipcode,
        mobility: userData?.mobility,
      };

      // Fire a single tracking event at the end with the user's hash.
      trackEvents(userData?.hash, "Delete Account", payload);
      //   we first delete the user data from the database
      await app.deleteUser(app.currentUser);
      const deleteDbData = await axios.post(
        `http://localhost:8081/api/v1/auth/delete_account`,
        { userID: userData.userID, email: userData.auth.email }
      );
     
      // Simulate deletion (or call your API endpoint here)
      console.log("Deleting account...", payload);
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      if (app) {
        localStorage.clear();
        const anonymousUser = await app?.logIn(Realm.Credentials.anonymous());
        setUser(anonymousUser);
        setClient(app?.currentUser?.mongoClient("mongodb-atlas"));
        setUserData({});
        router.push("/");
        setLoading(false);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Delete Account (Step {step} of 3)</DialogTitle>
          <DialogDescription>
            {step === 1 &&
              "What is the primary reason for deleting your account?"}
            {step === 2 &&
              "What can we do to improve your experience? (Optional)"}
            {step === 3 &&
              "To confirm deletion, please type DELETE MY ACCOUNT in the field below. This confirms that you understand this action is irreversible."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-4"
            placeholder="Enter your reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}

        {step === 2 && (
          <textarea
            className="w-full border border-gray-300 rounded p-2 mt-4"
            placeholder="Your suggestions or feedback (optional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        )}

        {step === 3 && (
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2 mt-4"
            placeholder="Type DELETE MY ACCOUNT"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
        )}

        <DialogFooter className="mt-6">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmationText !== "DELETE MY ACCOUNT" || loading}
              >
                {loading ? "Deleting..." : "Delete Account"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAccount;
