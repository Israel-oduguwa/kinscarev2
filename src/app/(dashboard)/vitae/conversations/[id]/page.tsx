import ConversationRoom from "@/Conversations/ConversationRoom";

export const metadata = {
  title: "Conversation | Caregiver Dashboard",
  description: "Chat with providers in real time.",
};

export default async function CaregiverConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ConversationRoom
      conversationSid={id}
      basePath="/vitae/conversations"
      variant="embedded"
    />
  );
}
