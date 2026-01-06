"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidgetUI = dynamic(() => import("@/ChatWidgets/ChatWidgetUI"), {
  ssr: false,
});

const isConversationPath = (pathname: string) => {
  return (
    pathname.startsWith("/provider/conversations") ||
    pathname.startsWith("/vitae/conversations")
  );
};

export default function ChatWidgetGate() {
  const pathname = usePathname();
  if (isConversationPath(pathname)) return null;
  return <ChatWidgetUI />;
}
