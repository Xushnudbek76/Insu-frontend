import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack, Badge } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import { useReactiveVar } from '@apollo/client/react';
import { useTranslation } from 'next-i18next/pages';
import { socketVar, userVar } from '@/apollo/store';
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
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [messageInput, setMessageInput] = useState<string>('');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');

  const user = useReactiveVar(userVar);
  const socket = useSocket();

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
  }, [messagesList]);

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
    if (e.key === 'Enter') {
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
    <Stack className="chatting">
      <button className="chat-button" onClick={handleOpenChat}>
        {open ? <CloseFullscreenIcon /> : <ChatBubbleOutlineIcon />}
      </button>

      <Stack className={`chat-frame ${open ? 'open' : ''}`}>
        <Box className="chat-top" component="div">
          <span>{t('Live Chat')}</span>
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
              <div className="welcome">{t('Welcome to Live Chat!')}</div>
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
            name="message"
            className="msg-input"
            placeholder={t('Type a message...')}
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="send-msg-btn" onClick={handleSendMessage}>
            <SendIcon sx={{ color: '#fff' }} />
          </button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default Chat;
