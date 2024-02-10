import React from 'react';
import Layout from '../components/layout/Layout';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { useUser } from '../lib/useUser';
import { ErrorPageContent } from '../components/layout/ErrorPage';
import { KeyValue } from '../models/interfaces/KeyValue';
import { Role } from '../models/enums/Role';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUser('/login', '/cash-payments', undefined, false, Role.READONLY);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Behörighetsfel';

const NoAccessPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => (
    <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
        <ErrorPageContent errorMessage="Behörighetsfel: Du har inte behörighet att visa den här sidan" />
    </Layout>
);

export default NoAccessPage;
