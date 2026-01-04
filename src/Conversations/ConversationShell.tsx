"use client";

import ConversationSidebar from "@/Conversations/ConversationSidebar";
import { ConversationsProvider } from "@/Conversations/ConversationsContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

type ConversationShellProps = {
  basePath: string;
  emptyLabel: string;
  children: React.ReactNode;
};

export default function ConversationShell({
  basePath,
  emptyLabel,
  children,
}: ConversationShellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConversationsProvider>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <div className="mx-auto flex h-[calc(100svh-64px)] min-h-0 w-full max-w-[1700px] flex-col gap-4 overflow-hidden px-0 py-0 lg:py-2 md:h-[calc(100vh-120px)] md:flex-row md:gap-6 md:px-4 md:py-6">
          <aside className="hidden h-full w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.35)] md:block md:max-w-[320px]">
            <ConversationSidebar basePath={basePath} emptyLabel={emptyLabel} />
          </aside>

          <section className="flex h-full min-h-0 flex-1 rounded-none border-0 bg-white/80 shadow-none md:rounded-2xl md:border md:border-slate-200/70 md:shadow-[0_18px_30px_-28px_rgba(15,23,42,0.35)]">
            {children}
          </section>
        </div>

        <SheetContent side="left" className="w-[320px] bg-white/95 p-0">
          <SheetHeader className="border-b border-slate-200/70 px-4 py-4">
            <SheetTitle>Conversations</SheetTitle>
          </SheetHeader>
          <ConversationSidebar
            basePath={basePath}
            emptyLabel={emptyLabel}
            onNavigate={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </ConversationsProvider>
  );
}
