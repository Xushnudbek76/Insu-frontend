import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutAdmin from '@/layout/LayoutAdmin';

const AdminHome: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/_admin/users');
  }, [router]);

  return null;
};

export default withLayoutAdmin(AdminHome);
