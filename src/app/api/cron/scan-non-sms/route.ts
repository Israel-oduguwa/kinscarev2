"use server";

import { NextResponse } from "next/server";

export async function GET() {
  const apiBase = "https://jrp7pe2xhj.us-east-1.awsapprunner.com"
  // const cronSecret = process.env.CRON_SECRET;

  if (!apiBase) {
    return NextResponse.json(
      { ok: false, error: "Missing API_BASE_URL or CRON_SECRET." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `${apiBase}/api/v1/providers/jumpstart/scan-non-sms-providers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: text || "Scan failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Scan failed." },
      { status: 500 }
    );
  }
}
