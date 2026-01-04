"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type ProviderTwilioLeadFormProps = {
  initialEmail?: string;
  initialPhone?: string;
  initialZipcode?: string;
  flowSid?: string;
  executionSid?: string;
  source?: string;
  tags?: string[];
  variant?: "standalone" | "dashboard";
  onSuccess?: () => void;
};

const ENDPOINT =
  "http://https://jrp7pe2xhj.us-east-1.awsapprunner.com/webhooks/twilio/capture-lead";

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
  variant = "standalone",
  onSuccess,
}: ProviderTwilioLeadFormProps) {
  const [email, setEmail] = React.useState(initialEmail);
  const [phone, setPhone] = React.useState(initialPhone);
  const [zipcode, setZipcode] = React.useState(initialZipcode);
  const [status, setStatus] = React.useState<"idle" | "submitting">("idle");
  const isDashboard = variant === "dashboard";

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

    if (!email.trim() || !phone.trim() || !zipcode.trim()) {
      toast.error("Phone, zipcode, and email are required.");
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

      // Clear fields after successful submit
      setEmail("");
      setPhone("");
      setZipcode("");
      setStatus("idle");
      toast.success("Provider added to the SMS flow", {
        description: "We’ll start the Twilio follow-up shortly.",
      });
      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.message || "Something went wrong while capturing this lead.";
      toast.error("Failed to capture lead", { description: message });
      setStatus("idle");
    }
  };

  const isSubmitting = status === "submitting";

  const outerClass = isDashboard
    ? "max-w-5xl space-y-6"
    : "min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 px-4";
  const textAccent = isDashboard ? "text-blue-600" : "text-cyan-300";
  const headingColor = isDashboard ? "text-slate-900" : "text-white";
  const subTextColor = isDashboard ? "text-slate-600" : "text-slate-300";
  const cardClass = isDashboard
    ? "bg-white/80 border border-slate-200/70 shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] backdrop-blur text-slate-900 rounded-2xl"
    : "bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur text-white";
  const cardDescriptionColor = isDashboard ? "text-slate-600" : "text-slate-300";
  const labelColor = isDashboard ? "text-slate-700" : "text-slate-200";
  const inputClass = isDashboard
    ? "bg-white/90 border-slate-200 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
    : "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500";
  const helperTextColor = isDashboard ? "text-slate-500" : "text-slate-400";
  const headerAlign = isDashboard ? "text-left" : "text-center";
  const buttonClass = isDashboard
    ? "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
    : "w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold";

  return (
    <div className={outerClass}>
      <div className=" space-y-8">
        <div className={`${headerAlign} space-y-3`}>
          <p className={`${textAccent} text-xs font-semibold tracking-widest uppercase`}>
            Twilio SMS Flow
          </p>
          <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${headingColor}`}>
            Add a Provider to the SMS Flow
          </h1>
          <p className={`${subTextColor}`}>
            Capture a provider&apos;s contact details so we can enroll them into the
            Twilio SMS flow and keep the conversation going.
          </p>
        </div>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-2xl">Provider contact</CardTitle>
            <CardDescription className={cardDescriptionColor}>
              We&apos;ll send this info directly to the Twilio capture webhook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={labelColor}>
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipcode" className={labelColor}>
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
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={labelColor}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="provider@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={buttonClass}
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

              <p className={`text-xs ${helperTextColor}`}>
                We automatically pass flow and execution IDs from the URL when
                provided, along with tags: {mergedTags.join(", ")}.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
