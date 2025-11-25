// components/ToastPortal.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export type ToastMsg = {
  type: "success" | "error" | "warning" | "info";
  message: string;
  title?: string;
};

export default function ToastPortal({ messages = [] as ToastMsg[] }) {
  useEffect(() => {
    messages.forEach((m) => {
      if (!m?.message) return;
      switch (m.type) {
        case "success":
          toast.success(m.message, { description: m.title });
          break;
        case "warning":
          toast.warning(m.message, { description: m.title });
          break;
        case "error":
          toast.error(m.message, { description: m.title });
          break;
        default:
          toast(m.message, { description: m.title });
      }
    });
  }, [messages]);

  return null;
}
