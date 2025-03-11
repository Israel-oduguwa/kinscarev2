import { NextResponse } from "next/server";
import axios from "axios";

// Handler for GET requests
export async function GET(req: Request) {
  try {
    // Get the user's IP address from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const userIp =   forwarded || req.headers.get("x-real-ip") || ""; //"216.73.163.219"

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


// http://localhost:3000/excelcna?hashedUserData=d16cfc0a0442745acc2ff6c7a8f67f5db1461503dd3c4d1580a0273a8c33937f&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWE2ZWJiYjJiMGJmMTJlNDhjN2NhNTgiLCJoYXNoZWRVc2VyRGF0YSI6ImQxNmNmYzBhMDQ0Mjc0NWFjYzJmZjZjN2E4ZjY3ZjVkYjE0NjE1MDNkZDNjNGQxNTgwYTAyNzNhOGMzMzkzN2YiLCJwaG9uZU51bWJlciI6IisyMzQ3MDgxNzgzMjUyIiwiZW1haWwiOiJvZHVndXdhLmlzcmFlbDIyQGdtYWlsLmNvbSIsInJvbGUiOiJjYXJlZ2l2ZXIiLCJsbmFtZSI6Ik9kdWd1d2EiLCJmbmFtZSI6IklzcmFlbCBjdXN0b20iLCJkYXRlQ3JlYXRlZCI6IjIwMjUtMDMtMDlUMTk6MTM6MDUuNDE2WiIsImlhdCI6MTc0MTU0NzU4NSwiZXhwIjoxNzQ0MTM5NTg1fQ.VKO8DuGhLAbktlLQOpO2ePrvYM_WZLO99LLdJWfja3A&kincaret=7754bcc3d85c20ed5ce7ca9d7b08d73c9086c93fc092fe93080684472f18d46b4e36c41603c7d933487d768d2d095c07c60f344c204c35c0e5e891c468100684