import React from 'react';
import Layout from '../components/layout/Layout';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { ErrorPageContent } from '../components/layout/ErrorPage';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Behörighetsfel';

const NoAccessPage: React.FC<Props> = ({ user }: Props) => (
    <Layout title={pageTitle} currentUser={user}>
        <ErrorPageContent errorMessage="Behörighetsfel: Du har inte behörighet att visa den här sidan" />
    </Layout>
);

export default NoAccessPage;
