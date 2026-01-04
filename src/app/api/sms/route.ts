import { NextRequest, NextResponse } from "next/server";
import client from "twilio";

// Initialize the Twilio client with account credentials.
const SID = "ACf74503b1d79d4249214a626c95f3c7b2";
const AuthT = "4893f8fac21f9c8a2d24fdfaba8d3f76";
const MessagingServiceSid = "MG4f1cfd864132764cc6054275ff68a63d";
const twilioClient = client(SID, AuthT);

// Normalize phone numbers into E.164 for Twilio.
const normalizePhone = (phone?: string | null) => {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  // Default handling for local formats; adjust if your default country differs.
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  return `+${digits}`;
};

/**
 * Handles POST requests to send SMS via Twilio.
 * @param req - The Next.js request object.
 * @returns NextResponse - The response to the client.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { body: messageBody, to } = body;

    // Validate required fields
    if (!messageBody || !to) {
      return NextResponse.json(
        { success: false, message: "Body and recipient ('to') are required." },
        { status: 400 }
      );
    }

    const normalizedTo = normalizePhone(to);
    if (!normalizedTo) {
      return NextResponse.json(
        { success: false, message: "Recipient phone number is invalid." },
        { status: 400 }
      );
    }

    // Send the SMS using Twilio
    const send = await twilioClient.messages.create({
      body: messageBody,
      messagingServiceSid: MessagingServiceSid,
      to: normalizedTo,
      shortenUrls: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully.",
        data: send,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message.",
        error: error.message || "Unknown error occurred.",
      },
      { status: 500 }
    );
  }
}
