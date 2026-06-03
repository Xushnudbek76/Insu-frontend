import React, { useEffect, useState, useMemo } from 'react';
import { Stack, Box, Avatar } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { initializeApollo } from '@/apollo/client';
import { GET_LATEST_COMMENTS } from '@/apollo/comment/query';
import { toAssetUrl } from '@/libs/api';

interface CommentMember {
  _id: string;
  memberNick?: string | null;
  memberImage?: string | null;
}

interface HomeComment {
  _id: string;
  commentContent: string;
  createdAt: string;
  memberData?: CommentMember | null;
}

interface GetLatestCommentsResponse {
  getLatestComments: {
    list: HomeComment[];
  };
}

const getCommentAvatar = (image?: string | null) =>
  toAssetUrl(image) ?? '/img/profile/defaultUser.svg';

const HomeComments: React.FC = () => {
  const device = useDeviceDetect();
  const [comments, setComments] = useState<HomeComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = initializeApollo(null);
    setLoading(true);
    setError(null);

    client
      .query<GetLatestCommentsResponse>({
        query: GET_LATEST_COMMENTS,
        variables: {
          input: {
            page: 1,
            limit: 8,
            sort: 'createdAt',
            direction: 'DESC',
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setComments(response.data.getLatestComments.list || []);
      })
      .catch((err: any) => {
        // eslint-disable-next-line no-console
        console.error('Error, getLatestComments', err);
        setError("Couldn't load comments. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayComments = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    if (comments.length >= 4) return comments;

    // For visual consistency on the homepage, repeat comments
    // so that we always have at least 4 slides in the row.
    const target = 8;
    const repeated: HomeComment[] = [];
    for (let i = 0; i < target; i += 1) {
      repeated.push(comments[i % comments.length]);
    }
    return repeated;
  }, [comments]);

  const hasComments = displayComments && displayComments.length > 0;
  const slidesPerView = device === 'mobile' ? 1.1 : 3;
  const spaceBetween = device === 'mobile' ? 12 : 24;

  return (
    <Stack className={'home-comments'}>
      <Stack className={'container'}>
        <Stack className={'info-box'}>
          <Box component={'div'} className={'left'}>
            <span>What our members say</span>
            <p>Real feedback from people using our insurance.</p>
          </Box>
        </Stack>

        <Stack className={'comments-wrapper'}>
          {loading && (
            <Box component={'div'} className={'empty-list'}>
              Loading comments...
            </Box>
          )}

          {!loading && error && (
            <Box component={'div'} className={'empty-list'}>
              {error}
            </Box>
          )}

          {!loading && !error && !hasComments && (
            <Box component={'div'} className={'empty-list'}>
              No comments yet
            </Box>
          )}

          {!loading && !error && hasComments && (
            <Swiper
              modules={[Autoplay, Pagination]}
              loop={true}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              centeredSlides={false}
              speed={4000}
              className={'comments-swiper'}
              observer={true}
              observeParents={true}
              slidesPerView={slidesPerView}
              spaceBetween={spaceBetween}
            >
              {displayComments.map((comment, index) => {
                const member = comment.memberData;
                const avatarSrc = getCommentAvatar(member?.memberImage);
                const nick = member?.memberNick || 'Member';

                return (
                  <SwiperSlide key={`${comment._id}-${index}`}>
                    <Box component={'div'} className={'comment-card'}>
                      <Box component={'div'} className={'comment-header'}>
                        <Avatar
                          src={avatarSrc}
                          alt={nick}
                          className={'comment-avatar'}
                        />
                        <Box component={'div'} className={'comment-author'}>
                          <strong className={'name'}>{nick}</strong>
                        </Box>
                      </Box>
                      <p className={'comment-content'}>{comment.commentContent}</p>
                    </Box>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default HomeComments;
