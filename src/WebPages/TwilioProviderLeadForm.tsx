"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type ProviderTwilioLeadFormProps = {
  initialEmail?: string;
  initialPhone?: string;
  initialZipcode?: string;
  flowSid?: string;
  executionSid?: string;
  source?: string;
  tags?: string[];
};

const ENDPOINT =
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com/webhooks/twilio/capture-lead";

function sanitizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export default function TwilioProviderLeadForm({
  initialEmail = "",
  initialPhone = "",
  initialZipcode = "",
  flowSid,
  executionSid,
  source,
  tags = [],
}: ProviderTwilioLeadFormProps) {
  const [email, setEmail] = React.useState(initialEmail);
  const [phone, setPhone] = React.useState(initialPhone);
  const [zipcode, setZipcode] = React.useState(initialZipcode);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">(
    "idle"
  );

  const mergedTags = React.useMemo(() => {
    const base = ["provider", "twilio", "sms"];
    const extras = tags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.toLowerCase());
    return Array.from(new Set([...base, ...extras]));
  }, [tags]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !phone.trim() || !zipcode.trim()) {
      setError("Phone, zipcode, and email are required.");
      return;
    }

    setStatus("submitting");

    const payload = {
      email: email.trim(),
      phone: phone.trim(),
      zipcode: zipcode.trim(),
      source: source || "twilio",
      channel: "sms",
      flowSid: flowSid || undefined,
      executionSid: executionSid || undefined,
      jump_start: true,
      timestamp: new Date().toISOString(),
      tags: mergedTags,
      contact: {
        channel: {
          address: sanitizePhone(phone),
        },
      },
    };

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setStatus("success");
      toast({
        title: "Success",
        description: "Provider has been added to the Twilio SMS flow.",
      });
    } catch (err: any) {
      const message =
        err?.message || "Something went wrong while capturing this lead.";
      setError(message);
      setStatus("idle");
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <main className="min-h-screen pt-56 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <p className="text-cyan-300 text-xs font-semibold tracking-widest uppercase">
            Twilio SMS Flow
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Add a Provider to the SMS Flow
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Capture a provider&apos;s contact details so we can enroll them into the
            Twilio SMS flow and keep the conversation going.
          </p>
        </div>

        <Card className="bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Provider contact</CardTitle>
            <CardDescription className="text-slate-300">
              We&apos;ll send this info directly to the Twilio capture webhook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-200">
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipcode" className="text-slate-200">
                    Zipcode
                  </Label>
                  <Input
                    id="zipcode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="94105"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="provider@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/40">
                  <AlertDescription className="text-red-100">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {status === "success" && (
                <Alert className="bg-emerald-500/10 border-emerald-500/40 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-emerald-50">
                      Lead captured. We&apos;ll follow up via SMS.
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending to Twilio...
                  </span>
                ) : (
                  "Add to SMS flow"
                )}
              </Button>

              <p className="text-xs text-slate-400">
                We automatically pass flow and execution IDs from the URL when
                provided, along with tags: {mergedTags.join(", ")}.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
