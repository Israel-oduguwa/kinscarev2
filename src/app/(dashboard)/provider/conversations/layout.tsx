import ConversationShell from "@/Conversations/ConversationShell";

export default function ProviderConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConversationShell
      basePath="/provider/conversations"
      emptyLabel="No caregiver chats yet."
    >
      {children}
    </ConversationShell>
  );
}
