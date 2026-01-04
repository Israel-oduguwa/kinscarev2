"use server";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiBase = "http://https://jrp7pe2xhj.us-east-1.awsapprunner.com";
  const { searchParams } = new URL(request.url);
  const hours = searchParams.get("hours");

  if (!apiBase) {
    return NextResponse.json(
      { ok: false, error: "Missing API_BASE_URL." },
      { status: 500 }
    );
  }

  const params = new URLSearchParams();
  if (hours) params.set("hours", hours);
  const suffix = params.toString() ? `?${params.toString()}` : "";

  try {
    const res = await fetch(
      `${apiBase}/api/v1/providers/jumpstart/notifications/payment-reminders${suffix}`,
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
        { ok: false, error: text || "Payment reminder failed." },
        { status: 500 }
      );
    }

    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Payment reminder failed." },
      { status: 500 }
    );
  }
}
