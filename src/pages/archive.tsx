import React from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import useSwr from 'swr';
import Link from 'next/link';
import LargeBookingTable from '../components/LargeBookingTable';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { Button } from 'react-bootstrap';
import { bookingsFetcher } from '../lib/fetchers';
import { TableLoadingPage } from '../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../components/layout/ErrorPage';
import { IfNotReadonly } from '../components/utils/IfAdmin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { toBookingViewModel } from '../lib/datetimeUtils';
import { KeyValue } from '../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Alla bokningar';
const breadcrumbs = [{ link: 'archive', displayName: pageTitle }];

const ArchiveListPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: bookings, error } = useSwr('/api/bookings', bookingsFetcher);

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

    if (!bookings) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    const bookingsToShow = bookings?.map(toBookingViewModel);
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
            <LargeBookingTable bookings={bookingsToShow} />
        </Layout>
    );
};

export default ArchiveListPage;
