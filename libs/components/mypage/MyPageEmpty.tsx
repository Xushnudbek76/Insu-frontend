import { Stack } from '@mui/material';
import EmptyIcon from '@mui/icons-material/InboxOutlined';

interface MyPageEmptyProps {
  title: string;
  text: string;
}

const MyPageEmpty = ({ title, text }: MyPageEmptyProps) => (
  <Stack className='mypage-empty'>
    <EmptyIcon />
    <h3>{title}</h3>
    <p>{text}</p>
  </Stack>
);

export default MyPageEmpty;
