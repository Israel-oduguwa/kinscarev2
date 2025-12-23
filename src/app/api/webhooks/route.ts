import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
const API_BASE =
  process.env.BACKEND_API_BASE ||
  "http://localhost:8081";

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
      case "user.created": {
        const url = `${API_BASE.replace(
          /\/+$/,
          ""
        )}/api/v1/auth/clerk/user_created`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: evt.data }),
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Upstream responded ${res.status}: ${text}`);
        }
        break;
      }
      case "user.deleted": {
        const url = `${API_BASE.replace(
          /\/+$/,
          ""
        )}/api/v1/auth/clerk/user_deleted`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: evt.data }),
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Upstream responded ${res.status}: ${text}`);
        }
        break;
      }
      case "user.updated": {
        console.log("User updated event received");
        break;
      }
      default:
        // ignore other event types
        break;
    }
  } catch (err: any) {
    console.error("Webhook handling failed:", err?.message || err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
