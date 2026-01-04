"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import axios from "axios";

interface FormData {
  role: string;
  zipcode: string;
}
export const completeOnboarding = async (formData: FormData) => {
  const { isAuthenticated, userId, getToken } = await auth();

  if (!isAuthenticated) {
    return { message: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        zipcode: formData.zipcode,
        role: formData.role,
      },
    });

    // then lets update our database too
    // const jwt = await getToken({ template: "backend" }); // create this template in Clerk
    const payload: any = {
      role: formData.role,
      zipcode: formData.zipcode,
      userID: userId,
    };
    const token = await getToken();
      
    const updateDatabase = await axios.post(
      "http://https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/user_onboarding",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // console.log(updateDatabase.data);
    if (updateDatabase.data.success) {
      return {
        message: updateDatabase.data.message,
        success: updateDatabase.data.success,
        role: updateDatabase.data.role,
      };
    } else {
      return {
        success: false,
      };
    }
  } catch (err) {
    return { error: "There was an error updating the user metadata." };
  }
};
