import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import {
  handleUserCreated,
  handleUserDeleted,
  handleUserUpdated,
} from "@/lib/clerkWebhookHandlers";

export async function POST(req: NextRequest) {
  let evt: WebhookEvent;
  try {
    evt = (await verifyWebhook(req)) as WebhookEvent;
  } catch (err: any) {
    console.error("Webhook verification failed:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        // ignore unhandled events
        break;
    }
  } catch (err: any) {
    console.error("Webhook handling failed:", err?.message || err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
