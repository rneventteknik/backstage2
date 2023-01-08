import React from 'react';
import { ErrorPage } from '../components/layout/ErrorPage';
import Header from '../components/layout/Header';
import Layout from '../components/layout/Layout';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { bookingsFetcher } from '../lib/fetchers';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import useSwr from 'swr';
import { Role } from '../models/enums/Role';
import { Status } from '../models/enums/Status';
import AdminBookingList from '../components/admin/AdminBookingList';
import { toBookingViewModel } from '../lib/datetimeUtils';
import { KeyValue } from '../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.ADMIN);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Adminöversikt';
const breadcrumbs = [{ link: 'admin-overview', displayName: pageTitle }];

const AdminOverviewPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: bookings, error, isValidating } = useSwr('/api/bookings', bookingsFetcher);

    if (error) {
        return (
            <ErrorPage
                errorMessage={error.message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (isValidating || !bookings) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    const bookingsToShow = bookings
        ?.map(toBookingViewModel)
        ?.filter((b) => b.status === Status.DONE || b.status === Status.BOOKED)
        ?.filter((b) => b.usageStartDatetime && b.usageStartDatetime?.getTime() < Date.now());
    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>
            <AdminBookingList bookings={bookingsToShow} />
        </Layout>
    );
};

export default AdminOverviewPage;
