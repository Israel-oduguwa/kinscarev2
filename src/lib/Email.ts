// This is a utitlty email sender  functioin the helps send email

import axios from "axios";

const baseUrl = "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/email";

export interface CustomerSignupParams {
  email: string;
  name: string;
  role: string;
}

/**
 * Send a “customer signup” email by forwarding to your existing
 * Express backend at `${BASE_URL}/customer-signup`.
 */
export async function sendCustomerSignupEmail(params: CustomerSignupParams) {
  // The base URL for your Express email service must be exposed as NEXT_PUBLIC_*
  try {
    await axios.post(`${baseUrl}/customer-signup`, {
      email: params.email,
      name: params.name,
      role: params.role,
    });
  } catch (err: any) {
    // Log server‐side errors for debugging, but don’t throw—caller can continue
    console.error(
      "Failed to send customer signup email:",
      err?.response?.data || err.message
    );
  }
}
