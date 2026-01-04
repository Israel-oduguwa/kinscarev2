import ConversationRoom from "@/Conversations/ConversationRoom";

export const metadata = {
  title: "Conversation | Provider Dashboard",
  description: "Chat with caregivers in real time.",
};

export default async function ProviderConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ConversationRoom
      conversationSid={id}
      basePath="/provider/conversations"
      variant="embedded"
    />
  );
}
