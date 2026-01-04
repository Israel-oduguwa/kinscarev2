import ConversationEmptyState from "@/Conversations/ConversationEmptyState";

export const metadata = {
  title: "Conversations | Caregiver Dashboard",
  description: "Chat with providers in real time.",
};

export default function CaregiverConversationsPage() {
  return (
    <ConversationEmptyState
      basePath="/vitae/conversations"
      title="Your talent chats live here"
      description="Select a provider from the left panel to review the thread."
      icon="✨"
    />
  );
}
