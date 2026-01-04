import ConversationShell from "@/Conversations/ConversationShell";

export default function CaregiverConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConversationShell
      basePath="/vitae/conversations"
      emptyLabel="No provider chats yet."
    >
      {children}
    </ConversationShell>
  );
}
