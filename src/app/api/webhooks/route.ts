import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
const API_BASE =
  process.env.BACKEND_API_BASE ||
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com";

export async function POST(req: NextRequest) {
  let evt: WebhookEvent;
  try {
    evt = (await verifyWebhook(req)) as WebhookEvent;
  } catch (err: any) {
    console.error("Webhook verification failed:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const endpoint =
      evt.type === "user.deleted"
        ? "/api/v1/auth/clerk/user_deleted"
        : "/api/v1/auth/clerk/user_created";

    const url = `${API_BASE.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: evt.data }),
      // 10s timeout safeguard for hung upstreams
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upstream responded ${res.status}: ${text}`);
    }
  } catch (err: any) {
    console.error("Webhook handling failed:", err?.message || err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
