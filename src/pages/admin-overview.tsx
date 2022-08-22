import React from 'react';
import { ErrorPage } from '../components/layout/ErrorPage';
import Header from '../components/layout/Header';
import Layout from '../components/layout/Layout';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { bookingsFetcher } from '../lib/fetchers';
import { useUserWithDefaultAccessControl } from '../lib/useUser';
import { toBookingViewModel } from '../lib/utils';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import useSwr from 'swr';
import { Role } from '../models/enums/Role';
import { Status } from '../models/enums/Status';
import AdminBookingList from '../components/admin/AdminBookingList';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.ADMIN);
type Props = { user: CurrentUserInfo };
const pageTitle = 'Adminöversikt';
const breadcrumbs = [{ link: 'admin-overview', displayName: pageTitle }];

const AdminOverviewPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: bookings, error, isValidating } = useSwr('/api/bookings', bookingsFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !bookings) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
    }

    const bookingsToShow = bookings
        ?.map(toBookingViewModel)
        ?.filter((b) => b.status === Status.DONE || b.status === Status.BOOKED)
        ?.filter((b) => b.startDate && b.startDate?.getTime() < Date.now());
    return (
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>
            <AdminBookingList bookings={bookingsToShow} />
        </Layout>
    );
};

export default AdminOverviewPage;
