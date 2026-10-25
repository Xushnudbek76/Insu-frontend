import { gql } from '@apollo/client';
export const START_PACKAGE_CONVERSATION = gql`
  mutation StartPackageConversation($packageId: String!) {
    startPackageConversation(packageId: $packageId) {
      _id
    }
  }
`;
export const SEND_CONVERSATION_MESSAGE = gql`
  mutation SendConversationMessage(
    $conversationId: String!
    $clientMessageId: String!
    $text: String!
  ) {
    sendConversationMessage(
      conversationId: $conversationId
      clientMessageId: $clientMessageId
      text: $text
    ) {
      _id
      conversationId
      senderId
      clientMessageId
      text
      createdAt
    }
  }
`;
export const MARK_CONVERSATION_READ = gql`
  mutation MarkConversationRead($conversationId: String!, $messageId: String!) {
    markConversationRead(
      conversationId: $conversationId
      messageId: $messageId
    ) {
      _id
      unreadCount
    }
  }
`;
