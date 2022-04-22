import React from 'react';
import Layout from '../components/layout/Layout';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../lib/useUser';
import Header from '../components/layout/Header';
import SmallBookingList from '../components/SmallBookingList';
import useSwr from 'swr';
import { bookingsFetcher } from '../lib/fetchers';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Bokningsarkiv';
const breadcrumbs = [{ link: 'archive', displayName: pageTitle }];

const ArchivePage: React.FC<Props> = ({ user }: Props) => {
    const { data: bookings } = useSwr('/api/bookings/', bookingsFetcher);

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={user}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

            <SmallBookingList title="Alla Bokningar" bookings={bookings}></SmallBookingList>
        </Layout>
    );
};

export default ArchivePage;
