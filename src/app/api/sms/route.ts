import { NextRequest, NextResponse } from "next/server";
import * as client from "twilio";

// Initialize the Twilio client with environment variables
const twilioClient = client(
  process.env.TWILIO_ACCOUNT_SID || "",
  process.env.TWILIO_AUTH_TOKEN || ""
);

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

    // Send the SMS using Twilio
    const send = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio verified phone number
      to,
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
