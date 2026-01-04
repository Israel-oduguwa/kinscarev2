export type ConversationPerson = {
  id: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
};

export type ConversationAttributes = {
  provider?: ConversationPerson;
  caregiver?: ConversationPerson;
};

export const parseConversationAttributes = (
  raw?: string | ConversationAttributes | null
): ConversationAttributes => {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as ConversationAttributes;
    } catch (_err) {
      return {};
    }
  }
  return raw;
};

export const getOtherParticipant = (
  attrs: ConversationAttributes,
  selfId?: string | null
) => {
  if (!selfId) return undefined;
  if (attrs.provider?.id === selfId) return attrs.caregiver;
  if (attrs.caregiver?.id === selfId) return attrs.provider;
  return undefined;
};

export const getRoleLabel = (
  attrs: ConversationAttributes,
  identity?: string | null
) => {
  if (!identity) return "Participant";
  if (attrs.provider?.id === identity) return "Provider";
  if (attrs.caregiver?.id === identity) return "Caregiver";
  return "Participant";
};
