import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack, Badge } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import { useReactiveVar } from '@apollo/client/react';
import { useTranslation } from 'next-i18next/pages';
import { userVar } from '@/apollo/store';
import { useSocket } from '@/libs/hooks/useSocket';
import { sweetMixinErrorAlert } from '@/libs/sweetAlert';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3007';

interface MemberData {
  _id: string;
  memberNick?: string;
  memberImage?: string;
}

interface MessagePayload {
  event: string;
  text: string;
  memberData: MemberData | null;
}

interface InfoPayload {
  event: string;
  totalClients: number;
  memberData: MemberData | null;
  action: string;
}

const Chat = () => {
  const chatRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [messageInput, setMessageInput] = useState<string>('');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');

  const user = useReactiveVar(userVar);
  const socket = useSocket();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const handleOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !chatRef.current?.contains(event.target)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', handleOutsidePointer, true);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!socket) return;

    const handleInfo = (data: InfoPayload) => {
      setOnlineUsers(data.totalClients);
    };

    const handleGetMessages = (data: { list: MessagePayload[] }) => {
      setMessagesList(data.list || []);
    };

    const handleMessage = (data: MessagePayload) => {
      setMessagesList((prev) => [...prev, data]);
    };

    socket.on('info', handleInfo);
    socket.on('getMessages', handleGetMessages);
    socket.on('message', handleMessage);

    return () => {
      socket.off('info', handleInfo);
      socket.off('getMessages', handleGetMessages);
      socket.off('message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messagesList, open]);

  const handleOpenChat = () => {
    setOpen((prev) => !prev);
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessageInput(e.target.value);
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      await sweetMixinErrorAlert(t('Message is empty!'));
      return;
    }

    if (!socket?.connected) {
      await sweetMixinErrorAlert(t('Not connected to chat server'));
      return;
    }

    if (!user?._id) {
      await sweetMixinErrorAlert(t('Please login to send messages'));
      return;
    }

    socket.emit('message', messageInput.trim());
    setMessageInput('');
  };

  const getMemberImage = (image?: string) => {
    if (!image) return '/img/profile/defaultUser.svg';
    if (image.startsWith('http')) return image;
    return `${SOCKET_URL}/${image}`;
  };

  return (
    <Stack className="chatting" ref={chatRef}>
      <button
        type="button"
        ref={triggerRef}
        className="chat-button"
        aria-label={open ? t('Close community chat') : t('Open community chat')}
        aria-expanded={open}
        aria-controls="community-chat"
        onClick={handleOpenChat}
      >
        {open ? <CloseFullscreenIcon /> : <ChatBubbleOutlineIcon />}
      </button>

      {open && <Stack id="community-chat" role="dialog" aria-labelledby="community-chat-title" className="chat-frame open">
        <Box className="chat-top" component="div">
          <span id="community-chat-title">{t('Community chat')}</span>
          <Badge
            badgeContent={onlineUsers}
            color="success"
            sx={{ ml: 2 }}
          />
        </Box>

        <Box
          className="chat-content"
          component="div"
          ref={chatContentRef}
        >
          <Stack className="chat-main">
            <Box
              component="div"
              sx={{ display: 'flex', m: '10px 0' }}
            >
              <div className="welcome">{t('This is a public room. For a private conversation, open an agent’s profile and choose Chat with Agent.')}</div>
            </Box>

            {messagesList.map((msg, index) => {
              const { text, memberData } = msg;
              const isOwnMessage = memberData?._id === user?._id;
              const memberImage = getMemberImage(memberData?.memberImage);

              return (
                <Box
                  key={`${memberData?._id || 'anon'}-${index}-${text?.substring(0, 10)}`}
                  component="div"
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    m: '10px 0',
                  }}
                >
                  {isOwnMessage ? (
                    <div className="msg-right">{text}</div>
                  ) : (
                    <>
                      <Avatar
                        alt={memberData?.memberNick || t('User')}
                        src={memberImage}
                        sx={{ width: 32, height: 32 }}
                      />
                      <div className="msg-left">{text}</div>
                    </>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box className="chat-bott" component="div">
          <input
            type="text"
            ref={inputRef}
            aria-label={t('Community message')}
            maxLength={2000}
            name="message"
            className="msg-input"
            placeholder={t('Type a message...')}
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="send-msg-btn" aria-label={t('Send message')} onClick={handleSendMessage}>
            <SendIcon sx={{ color: '#fff' }} />
          </button>
        </Box>
      </Stack>}
    </Stack>
  );
};

export default Chat;
