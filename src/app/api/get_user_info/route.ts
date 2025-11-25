import { connectToDatabase } from "@/Utils/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
 

export async function GET(request: NextRequest) {
  try {
    // Define the cookie name (same as in the original code)
    const TOKEN_NAME = "user_token" //"wZM$&NpU|@U{V_F$c@WB9)hir7hKQ[}jEfj0AR>SIVGr)%UW}Z5@>3*b)p[-@w_";
    const cookieStore = await cookies()
    
    const otpHash = cookieStore.get('user_token')
    // Get the OTP hash from the request cookies
    // console.log(cookieStore, otpHash)
    // If no OTP hash is found, return 401 Unauthorized
    if (!otpHash) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database and access the "contacts" collection
    const { db } = await connectToDatabase();
    const contacts = db.collection("contacts");

    // Query the database for a user with the matching OTP hash
    const user = await contacts.findOne(
      { otp_hash: otpHash },
      { projection: { auth_mode: 1, email: 1, tel: 1, role: 1, _id: 0 } }
    );

    // If a user is found, return it with a 200 status
    if (user) {
      return NextResponse.json(user, { status: 200 });
    } else {
      // If no user is found, return 404
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  } catch (error) {
    // Log the error and return a 500 Internal Server Error response
    console.error("Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}