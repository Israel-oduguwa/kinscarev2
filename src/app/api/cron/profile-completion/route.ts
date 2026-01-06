"use server";

import { NextResponse } from "next/server";

const apiBase = "https://jrp7pe2xhj.us-east-1.awsapprunner.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const intervalDays = searchParams.get("intervalDays");
  const dryRun = searchParams.get("dryRun");

  if (!apiBase) {
    return NextResponse.json(
      { ok: false, error: "Missing API base URL." },
      { status: 500 }
    );
  }

  const params = new URLSearchParams();
  if (intervalDays) params.set("intervalDays", intervalDays);
  if (dryRun) params.set("dryRun", dryRun);
  const suffix = params.toString() ? `?${params.toString()}` : "";

  try {
    const res = await fetch(
      `${apiBase}/api/v1/email/reminders/profile-completion${suffix}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: text || "Profile completion reminder failed." },
        { status: 500 }
      );
    }

    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { ok: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Profile completion reminder failed.",
      },
      { status: 500 }
    );
  }
}
