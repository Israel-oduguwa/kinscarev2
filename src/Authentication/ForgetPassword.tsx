"use client";

import React, { useContext, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import * as Realm from "realm-web";
import MongoContext from "@/app/MongoContext";

type ForgotPasswordDialogProps = {
  /** Prefill the email. User can still edit it. */
  email?: string;
  /** Wrap your button/link here; clicking it opens the dialog. */
  children: React.ReactNode;
  /** Controlled props if you want to manage open state from parent */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional callback after a successful send */
  onSent?: (email: string) => void;
};

export default function ForgotPasswordDialog({
  email,
  children,
  open,
  onOpenChange,
  onSent,
}: ForgotPasswordDialogProps) {
  const { toast } = useToast();
  const { app } = useContext(MongoContext) as { app: Realm.App };
  const [localEmail, setLocalEmail] = useState(email ?? "");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isValidEmail = useMemo(() => {
    // Simple, fast validation that catches almost all mistakes
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail);
  }, [localEmail]);

  async function handleSend() {
    if (!app) {
      toast({
        title: "App not ready",
        description: "Authentication app instance is missing.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidEmail) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Support both Realm SDK signatures just in case
      try {
        // Most versions: string signature
        // @ts-expect-error – allow both call shapes
        await app.emailPasswordAuth.sendResetPasswordEmail(localEmail);
      } catch {
        // Some examples show an object signature
        await app.emailPasswordAuth.sendResetPasswordEmail({ email: localEmail });
      }

      setSent(true);
      onSent?.(localEmail);
      toast({
        title: "Reset link sent",
        description: `If ${localEmail} is registered, you’ll receive an email shortly.`,
      });
    } catch (e: any) {
      const msg =
        e?.error || e?.message || "Couldn’t send the reset email. Please try again.";
      toast({ title: "Request failed", description: msg, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  }

  function ResetForm() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fp-email" className="text-sm">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              id="fp-email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value.trim())}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We’ll email you a secure link to reset your password.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!isValidEmail || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  function SuccessState() {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <div className="font-medium">Check your inbox</div>
            <div className="text-muted-foreground">
              We sent a reset link to <span className="font-medium">{localEmail}</span>.  
              The link will expire after a short time.
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSent(false);
            }}
          >
            Use a different email
          </Button>
          <Button type="button" onClick={() => onOpenChange?.(false)}>
            Done
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      // Reset transient state when closing
      if (!v) {
        setIsSending(false);
        setSent(false);
        setLocalEmail(email ?? "");
      }
      onOpenChange?.(v);
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Reset your password</DialogTitle>
          <DialogDescription>
            Enter the email tied to your account. We’ll send you a secure reset link.
          </DialogDescription>
        </DialogHeader>

        {sent ? <SuccessState /> : <ResetForm />}
      </DialogContent>
    </Dialog>
  );
}
