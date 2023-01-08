import React from 'react';
import Layout from '../../components/layout/Layout';
import Header from '../../components/layout/Header';
import useSwr from 'swr';
import Link from 'next/link';
import LargeBookingTable from '../../components/LargeBookingTable';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { bookingsFetcher } from '../../lib/fetchers';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { IfNotReadonly } from '../../components/utils/IfAdmin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import { showActiveBookings } from '../../lib/utils';
import { toBookingViewModel } from '../../lib/datetimeUtils';
import { KeyValue } from '../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Aktiva bokningar';
const breadcrumbs = [{ link: 'bookings', displayName: pageTitle }];

const BookingListPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
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

    const bookingsToShow = bookings?.map(toBookingViewModel).filter(showActiveBookings);
    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href="/bookings/new" passHref>
                        <Button variant="primary" as="span">
                            <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till bokning
                        </Button>
                    </Link>
                </IfNotReadonly>
            </Header>
            <LargeBookingTable bookings={bookingsToShow} tableSettingsOverride={{ defaultSortAscending: true }} />
        </Layout>
    );
};

export default BookingListPage;
