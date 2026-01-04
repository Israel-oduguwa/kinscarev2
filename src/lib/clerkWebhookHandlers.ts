import axios from "axios";
import { WebhookEvent } from "@clerk/nextjs/server";

const API_BASE =
  process.env.BACKEND_API_BASE ||
  "http://https://jrp7pe2xhj.us-east-1.awsapprunner.com";

async function postToBackend(path: string, payload: any) {
  const url = `${API_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function handleUserCreated(data: WebhookEvent["data"] | any) {
  await postToBackend("/api/v1/auth/clerk/user_created", { data });
}

export async function handleUserUpdated(data: WebhookEvent["data"] | any) {
  await postToBackend("/api/v1/auth/clerk/user_created", { data });
}

export async function handleUserDeleted(data: WebhookEvent["data"] | any) {
  await postToBackend("/api/v1/auth/clerk/user_deleted", { data });
}
