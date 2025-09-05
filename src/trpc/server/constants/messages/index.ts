import { authMessage } from './auth';

export const makeMessage = <S, E, T extends string>(
  section: T,
  [success, error]: [S, E]
) => {
  return {
    [section]: {
      success,
      error,
    },
  } as Record<T, { success: S; error: E }>;
};

const messages = {
  authMessage,
};

type MessageParts = keyof typeof messages;
type MessageSectionPart = keyof (typeof messages)[MessageParts];
type MessageSuccessMessages =
  keyof (typeof messages)[MessageParts][MessageSectionPart]['success'];
type MessageErrorMessages =
  keyof (typeof messages)[MessageParts][MessageSectionPart]['error'];

export const getErrorMessage = (
  part: MessageParts,
  section: MessageSectionPart,
  message: MessageErrorMessages
) => {
  return messages[part][section].error[message];
};

export const getSuccessMessage = (
  part: MessageParts,
  section: MessageSectionPart,
  message: MessageSuccessMessages
) => {
  return messages[part][section].success[message];
};
