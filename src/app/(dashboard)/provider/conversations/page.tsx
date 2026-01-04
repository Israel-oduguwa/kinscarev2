import ConversationEmptyState from "@/Conversations/ConversationEmptyState";

export const metadata = {
  title: "Conversations | Provider Dashboard",
  description: "Chat with caregivers in real time.",
};

export default function ProviderConversationsPage() {
  return (
    <ConversationEmptyState
      basePath="/provider/conversations"
      title="Your talent chats live here"
      description="Select a caregiver from the left panel to review the thread."
      icon="✨"
    />
  );
}
