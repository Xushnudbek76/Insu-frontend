import { gql } from '@apollo/client';
export const CONVERSATION_FIELDS = gql`
  fragment ConversationFields on Conversation {
    _id
    clientId
    agentId
    packageId
    packageName
    packagePrice
    coverageLimit
    unreadCount
    writable
    unavailableReason
    client {
      _id
      memberNick
      memberImage
    }
    agent {
      _id
      memberNick
      memberImage
    }
    lastMessage {
      _id
      conversationId
      senderId
      clientMessageId
      text
      createdAt
    }
  }
`;
export const GET_MY_CONVERSATIONS = gql`
  query GetMyConversations($page: Int!, $limit: Int!) {
    getMyConversations(page: $page, limit: $limit) {
      list {
        ...ConversationFields
      }
      total
    }
  }
  ${CONVERSATION_FIELDS}
`;
export const GET_CONVERSATION = gql`
  query GetConversation($conversationId: String!) {
    getConversation(conversationId: $conversationId) {
      ...ConversationFields
    }
  }
  ${CONVERSATION_FIELDS}
`;
export const GET_CONVERSATION_MESSAGES = gql`
  query GetConversationMessages($conversationId: String!, $before: String) {
    getConversationMessages(
      conversationId: $conversationId
      before: $before
      limit: 30
    ) {
      list {
        _id
        conversationId
        senderId
        clientMessageId
        text
        createdAt
      }
      nextCursor
    }
  }
`;
