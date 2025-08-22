import axios, { AxiosResponse } from "axios";

interface RewardReferrerRequest {
    providerUserID: string;
    milestone: "signup" | "identityVerified" | "subscription";
  }
  
  interface RewardReferrerResponse {
    success: boolean;
    message: string;
    [key: string]: any; // For any additional response fields
  }
  
  // send tremendous api
  export async function rewardReferrer(
    providerUserID: string,
    milestone: "signup" | "identityVerified" | "subscription"
  ): Promise<RewardReferrerResponse | null> {
    try {
      const payload: RewardReferrerRequest = { providerUserID, milestone };

      const response: AxiosResponse<RewardReferrerResponse> = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/reward-referrer", // Or your full API URL
        payload
      );

      if (response.data && response.data.success) {
        // Success
        // console.log(response.data.message);
        return response.data;
      } else {
        // Server returned a valid response, but not success
        console.error(response.data.message || "Rewarding failed");
        return null;
      }
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status code outside 2xx
        console.error("Server error:", error.response.data.message);
      } else {
        // Network error or other
        console.error("Network error:", error.message);
      }
      return null;
    }
  }
