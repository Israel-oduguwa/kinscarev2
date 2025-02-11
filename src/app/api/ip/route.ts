import { NextResponse } from "next/server";
import axios from "axios";

// Handler for GET requests
export async function GET(req: Request) {
  try {
    // Get the user's IP address from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const userIp =  "216.73.163.219" // forwarded || req.headers.get("x-real-ip") || "";

    // Check if IP exists
    if (!userIp) {
      return NextResponse.json(
        { error: "Cannot determine IP" },
        { status: 400 }
      );
    }

    const ipApiKey = process.env.IPAPI_KEY;

    // Fetch location information using ipapi
    const response = await axios.get(
      `http://api.ipstack.com/${userIp}?access_key=${ipApiKey}`
    );

    if (response.status === 200 && response.data) {
      const location = response.data;

      // Check if the data includes city and region
      if (!location) {
        return NextResponse.json(
          { error: "Cannot determine location" },
          { status: 404 }
        );
      }

      return NextResponse.json(location, { status: 200 });
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
