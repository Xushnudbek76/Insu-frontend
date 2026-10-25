import React, { useEffect, useState, useMemo } from 'react';
import { Stack, Box, Avatar } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useRouter } from 'next/router';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';

import 'swiper/css';

import useDeviceDetect from '@/libs/hooks/useDeviceDetect';
import { initializeApollo } from '@/apollo/client';
import { GET_LATEST_COMMENTS } from '@/apollo/comment/query';
import { toAssetUrl } from '@/libs/api';
import { useTranslation } from 'next-i18next/pages';
import { formatLocaleDate } from '@/libs/utils/locale';

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
  const router = useRouter();
  const { t } = useTranslation('common');
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
        setError(t('Could not load comments. Please try again later.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayComments = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    const target = 12;
    if (comments.length >= target) return comments;

    // The row loops continuously, so repeat short lists until
    // there are enough slides to fill it without gaps.
    const repeated: HomeComment[] = [];
    for (let i = 0; i < target; i += 1) {
      repeated.push(comments[i % comments.length]);
    }
    return repeated;
  }, [comments]);

  const hasComments = displayComments && displayComments.length > 0;
  // Cards keep a fixed width (set in the stylesheet) however wide the screen is
  const slidesPerView = 'auto';
  const spaceBetween = device === 'mobile' ? 12 : 20;

  return (
    <Stack className={'home-comments'}>
      <Stack className={'container'}>
        <Stack className={'info-box'}>
          <Box component={'div'} className={'left'}>
            <span className={'section-tag'}>{t('Reviews')}</span>
            <h2>{t('What our members say')}</h2>
            <p>{t('Real feedback from people using our insurance.')}</p>
          </Box>
        </Stack>

        <Stack className={'comments-wrapper'}>
          {loading && (
            <Box component={'div'} className={'empty-list'}>
              {t('Loading comments...')}
            </Box>
          )}

          {!loading && error && (
            <Box component={'div'} className={'empty-list'}>
              {error}
            </Box>
          )}

          {!loading && !error && !hasComments && (
            <Box component={'div'} className={'empty-list'}>
              {t('No comments yet')}
            </Box>
          )}

          {!loading && !error && hasComments && (
            <Swiper
              modules={[Autoplay]}
              loop={true}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
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
                const nick = member?.memberNick || t('Member');

                return (
                  <SwiperSlide key={`${comment._id}-${index}`}>
                    <Box component={'figure'} className={'comment-card'}>
                      <FormatQuoteRoundedIcon className={'comment-quote-mark'} />
                      <blockquote className={'comment-content'}>{comment.commentContent}</blockquote>
                      <Box component={'figcaption'} className={'comment-header'}>
                        <Avatar
                          src={avatarSrc}
                          alt={nick}
                          className={'comment-avatar'}
                        />
                        <Box component={'div'} className={'comment-author'}>
                          <strong className={'name'}>{nick}</strong>
                          <span className={'date'}>
                            {formatLocaleDate(comment.createdAt, router.locale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </Box>
                      </Box>
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
