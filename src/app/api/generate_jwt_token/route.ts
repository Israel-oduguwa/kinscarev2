import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { createHmac, createCipheriv, randomBytes } from "crypto";
import { connectToDatabase } from "@/Utils/mongodb";


// Secret key for JWT and hashing
const secretKey = "2b09fb445690dc137bc0036a3f75191aa32d61d48aade16c12692724368a0b3b5de74baaa876c2b4a7c83193d57b58084b76c2bb99735223b6633ceba8a6cb7ac6cdd7d06022905f6b73ff8303fddd1aca2be516682ef73fc4c68dc4a95ea84e671c47c524400df42a1769f650965fb570b414941f3b0a77c7752a13d85217fef8005d93bef688d585ebd5f60ebc0e6a4d77b4e6a081"; // the secrete key
// Encryption key (32 bytes for aes-256-cbc)
const encryptKey = Buffer.from("90bba75ad048b600836403be13fda8044d8ccfe3fdd1c6605445f109f7cbdc25", "hex");

function hashUserData(email: string, phoneNumber: string, secretKey: string, userId: string): string {
  const hmac = createHmac("sha256", secretKey);
  hmac.update(email + phoneNumber + userId);
  return hmac.digest("hex");
}

function encrypt(data: string, secretKey: Buffer): string | null {
  try {
    const iv = randomBytes(16); // Generate a new IV for each encryption
    const cipher = createCipheriv("aes-256-cbc", secretKey, iv);
    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return iv.toString("hex") + encryptedData; // Prepend IV to encrypted data
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
}

function generateUserId(phoneNumber: string, email: string, secretKey: string): string {
  const combinedData = `${phoneNumber}${email}`;
  const hash = createHmac("sha256", secretKey).update(combinedData).digest("hex").slice(0, 24);
  return hash;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    const { db } = await connectToDatabase();
    const csrfCollection = db.collection("csrf_tokens");

    // Generate CSRF token
    const csrfToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Insert CSRF token into the database
    const result = await csrfCollection.insertOne({ csrfToken });
    // console.log("Inserted CSRF token:", result);

    // Encrypt the CSRF token
    const encryptedToken = encrypt(csrfToken, encryptKey);
    if (!encryptedToken) {
      return NextResponse.json({ message: "Encryption failed" }, { status: 500 });
    }

    // Parse request body
    const { phoneNumber, email, role, lname, fname } = await request.json();

    // Generate user ID
    const userId = generateUserId(phoneNumber, email, secretKey);

    // Hash user data
    const hashedUserData = hashUserData(email, phoneNumber, secretKey, userId);

    // Create user data object
    const userData = {
      phoneNumber,
      email,
      role,
      dateCreated: new Date(),
      lname,
      fname,
    };

    // Create JWT token (expires in 1 month)
    const token = sign(
      {
        userId,
        hashedUserData,
        ...userData,
      },
      secretKey,
      { expiresIn: "30d" } // Updated to 1 month
    );

    // Return response with token and CSRF token
    return NextResponse.json(
      {
        token,
        hashedUserData,
        csrfToken: encryptedToken,
        success: true,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Adjust for production
          "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      },
    }
  );
}

// https://www.kinscare.org/excelcna?hashedUserData=d16cfc0a0442745acc2ff6c7a8f67f5db1461503dd3c4d1580a0273a8c33937f&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMWE2ZWJiYjJiMGJmMTJlNDhjN2NhNTgiLCJoYXNoZWRVc2VyRGF0YSI6ImQxNmNmYzBhMDQ0Mjc0NWFjYzJmZjZjN2E4ZjY3ZjVkYjE0NjE1MDNkZDNjNGQxNTgwYTAyNzNhOGMzMzkzN2YiLCJwaG9uZU51bWJlciI6IisyMzQ3MDgxNzgzMjUyIiwiZW1haWwiOiJvZHVndXdhLmlzcmFlbDIyQGdtYWlsLmNvbSIsInJvbGUiOiJjYXJlZ2l2ZXIiLCJsbmFtZSI6Ik9kdWd1d2EiLCJmbmFtZSI6IklzcmFlbCBjdXN0b20iLCJkYXRlQ3JlYXRlZCI6IjIwMjUtMDMtMDlUMTk6MTM6MDUuNDE2WiIsImlhdCI6MTc0MTU0NzU4NSwiZXhwIjoxNzQ0MTM5NTg1fQ.VKO8DuGhLAbktlLQOpO2ePrvYM_WZLO99LLdJWfja3A&kincaret=7754bcc3d85c20ed5ce7ca9d7b08d73c9086c93fc092fe93080684472f18d46b4e36c41603c7d933487d768d2d095c07c60f344c204c35c0e5e891c468100684