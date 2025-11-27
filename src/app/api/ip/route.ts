import { NextResponse } from "next/server";
import axios from "axios";

// Handler for GET requests
export async function GET(req: Request) {
  try {
    // Get the user's IP address from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");

    // x-forwarded-for can be a comma separated list; use the first public IP.
    const parsedForwarded = forwarded
      ?.split(",")
      .map((part) => part.trim())
      .filter(Boolean)[0];

    const userIp =
      process.env.NODE_ENV === "production"
        ? parsedForwarded || realIp || ""
        : "67.183.58.7";

    // Check if IP exists
    if (!userIp) {
      return NextResponse.json(
        { error: "Cannot determine IP" },
        { status: 400 }
      );
    }

    const ipApiKey = process.env.IPAPI_KEY;
    if (!ipApiKey) {
      return NextResponse.json(
        { error: "Missing IPAPI_KEY configuration" },
        { status: 500 }
      );
    }

    // Fetch location information using ipapi/ipstack
    const response = await axios.get(
      `http://api.ipstack.com/${userIp}?access_key=${ipApiKey}`
    );

    if (response.status === 200 && response.data) {
      const location = response.data;

      // ipstack returns an error payload with success=false
      if (location?.success === false || !location) {
        return NextResponse.json(
          { error: "Cannot determine location", details: location?.error },
          { status: 404 }
        );
      }

      const normalized = {
        ip: location.ip ?? userIp,
        city: location.city ?? null,
        region_name: location.region_name ?? location.region ?? null,
        country_code: location.country_code ?? location.country ?? null,
        zip:
          location.zip ??
          location.postal_code ??
          location.postal ??
          location.postcode ??
          null,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        raw: location,
      };

      return NextResponse.json(normalized, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch location" },
        { status: 500 }
      );
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching location: ", error);

    // Send an error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
