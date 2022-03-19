import React from 'react';
import Layout from '../components/layout/Layout';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../lib/useUser';
import Header from '../components/layout/Header';
import SmallEventList from '../components/SmallEventList';
import useSwr from 'swr';
import { eventsFetcher } from '../lib/fetchers';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Bokningsarkiv';
const breadcrumbs = [{ link: 'archive', displayName: pageTitle }];

const ArchivePage: React.FC<Props> = ({ user }: Props) => {
    const { data: events } = useSwr('/api/events/', eventsFetcher);

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={user}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

            <SmallEventList title="Alla Bokningar" events={events}></SmallEventList>
        </Layout>
    );
};

export default ArchivePage;
