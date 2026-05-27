import { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useQuery } from '@apollo/client/react';
import { Box, Collapse, Stack } from '@mui/material';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { GET_FAQS } from '@/apollo/faq/query';
import { GET_NOTICES } from '@/apollo/notice/query';
import withLayoutMain from '@/layout/LayoutHome';

const faqCategories = [
  { label: 'Policy', value: 'POLICY' },
  { label: 'Claims', value: 'CLAIMS' },
  { label: 'Payment', value: 'PAYMENT' },
  { label: 'Agents', value: 'AGENTS' },
  { label: 'Account', value: 'ACCOUNT' },
  { label: 'Community', value: 'COMMUNITY' },
  { label: 'Other', value: 'OTHER' },
];

const noticeInquiry = {
  page: 1,
  limit: 20,
  sort: 'createdAt',
  direction: 'DESC',
  search: {},
};

const faqInquiry = {
  page: 1,
  limit: 100,
  sort: 'faqOrder',
  direction: 'ASC',
  search: {},
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const CsPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'NOTICE' | 'FAQ'>('NOTICE');
  const [activeCategory, setActiveCategory] = useState('POLICY');
  const [openNoticeId, setOpenNoticeId] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const { data: noticeData, loading: noticeLoading } = useQuery(GET_NOTICES, {
    fetchPolicy: 'network-only',
    variables: { input: noticeInquiry },
  });
  const { data: faqData, loading: faqLoading } = useQuery(GET_FAQS, {
    fetchPolicy: 'network-only',
    variables: { input: faqInquiry },
  });

  const notices = (noticeData as any)?.getNotices?.list ?? [];
  const faqs = (faqData as any)?.getFaqs?.list ?? [];
  const visibleFaqs = useMemo(
    () => faqs.filter((faq: any) => faq.faqCategory === activeCategory),
    [activeCategory, faqs],
  );

  return (
    <Stack className='cs-center-page'>
      <Stack className='cs-center-hero'>
        <h1>Cs center</h1>
        <p>I will answer your questions</p>
      </Stack>

      <Stack className='cs-center-tabs'>
        <button className={activeTab === 'NOTICE' ? 'active' : ''} type='button' onClick={() => setActiveTab('NOTICE')}>
          Notice
        </button>
        <button className={activeTab === 'FAQ' ? 'active' : ''} type='button' onClick={() => setActiveTab('FAQ')}>
          FAQ
        </button>
      </Stack>

      {activeTab === 'NOTICE' ? (
        <Stack className='cs-center-section'>
          <h2>Notice</h2>
          <Stack className='cs-notice-table'>
            <Box className='cs-notice-head'>
              <span>Number</span>
              <span>Title</span>
              <span>Date</span>
            </Box>

            {noticeLoading ? <Box className='cs-empty-row'>Loading...</Box> : null}
            {!noticeLoading && !notices.length ? <Box className='cs-empty-row'>No notices found.</Box> : null}

            {notices.map((notice: any, index: number) => {
              const open = openNoticeId === notice._id;
              return (
                <Stack key={notice._id} className={open ? 'cs-notice-row open' : 'cs-notice-row'}>
                  <button
                    className='cs-notice-summary'
                    type='button'
                    onClick={() => setOpenNoticeId(open ? null : notice._id)}
                  >
                    <span className={index === 0 ? 'cs-notice-badge' : 'cs-notice-number'}>
                      {index === 0 ? notice.noticeCategory?.toLowerCase() : index + 1}
                    </span>
                    <strong>{notice.noticeTitle}</strong>
                    <span>{formatDate(notice.createdAt)}</span>
                  </button>
                  <Collapse in={open} timeout='auto' unmountOnExit>
                    <Box className='cs-notice-content'>{notice.noticeContent}</Box>
                  </Collapse>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      ) : (
        <Stack className='cs-center-section'>
          <Stack className='cs-faq-categories'>
            {faqCategories.map((category) => (
              <button
                className={activeCategory === category.value ? 'active' : ''}
                key={category.value}
                type='button'
                onClick={() => {
                  setActiveCategory(category.value);
                  setOpenFaqId(null);
                }}
              >
                {category.label}
              </button>
            ))}
          </Stack>

          <Stack className='cs-faq-list-panel'>
            {faqLoading ? <Box className='cs-empty-row'>Loading...</Box> : null}
            {!faqLoading && !visibleFaqs.length ? <Box className='cs-empty-row'>No FAQs found.</Box> : null}

            {visibleFaqs.map((faq: any) => {
              const open = openFaqId === faq._id;
              return (
                <Stack className='cs-faq-line' key={faq._id}>
                  <button type='button' onClick={() => setOpenFaqId(open ? null : faq._id)}>
                    <span>Q</span>
                    <strong>{faq.faqQuestion}</strong>
                    <KeyboardArrowDownOutlinedIcon className={open ? 'open' : ''} />
                  </button>
                  <Collapse in={open} timeout='auto' unmountOnExit>
                    <Box className='cs-faq-answer'>{faq.faqAnswer}</Box>
                  </Collapse>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default withLayoutMain(CsPage);
