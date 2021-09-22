import React from 'react';
import Layout from '../components/layout/Layout';
import { Alert } from 'react-bootstrap';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../lib/useUser';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Behörighetsfel';
const breadcrumbs = [{ link: 'no-access', displayName: pageTitle }];

const NoAccessPage: React.FC<Props> = ({ user }: Props) => (
    <Layout title={pageTitle} currentUser={user} breadcrumbs={breadcrumbs}>
        <h1>{pageTitle}</h1>
        <Alert variant="danger">Du har inte tillgång till den här sidan</Alert>
    </Layout>
);

export default NoAccessPage;
