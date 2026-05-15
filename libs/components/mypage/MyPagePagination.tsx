import { Stack } from '@mui/material';

interface MyPagePaginationProps {
  page: number;
  totalPages: number;
  onChange: (nextPage: number) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const MyPagePagination = ({ page, totalPages, onChange, t }: MyPagePaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <Stack className='mypage-pagination'>
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>
        {t('Previous')}
      </button>
      <span>{t('Page {{page}} of {{total}}', { page, total: totalPages })}</span>
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        {t('Next')}
      </button>
    </Stack>
  );
};

export default MyPagePagination;
