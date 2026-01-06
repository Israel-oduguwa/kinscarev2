"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MixpanelProvider = dynamic(() => import("@/lib/MixpanelProvider"), {
  ssr: false,
});
const IntercomProvider = dynamic(
  () => import("@/Providers/Utils/IntercomLoader"),
  { ssr: false }
);
const ChatWidgetGate = dynamic(() => import("@/ChatWidgets/ChatWidgetGate"), {
  ssr: false,
});

export default function ClientSideWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const onReady = () => {
      if (!cancelled) setReady(true);
    };

    const { requestIdleCallback, cancelIdleCallback } = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (requestIdleCallback) {
      const handle = requestIdleCallback(onReady, { timeout: 1500 });
      return () => {
        cancelled = true;
        cancelIdleCallback?.(handle);
      };
    }

    const timeoutId = window.setTimeout(onReady, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <MixpanelProvider />
      <ChatWidgetGate />
      <IntercomProvider />
    </>
  );
}
