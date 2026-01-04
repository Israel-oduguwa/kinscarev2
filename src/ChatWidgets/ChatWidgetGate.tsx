"use client";

import { usePathname } from "next/navigation";
import ChatWidgetUI from "@/ChatWidgets/ChatWidgetUI";

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
