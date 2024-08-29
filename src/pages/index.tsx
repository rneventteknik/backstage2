import React from 'react';
import Layout from '../components/layout/Layout';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import Header from '../components/layout/Header';
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import useSwr from 'swr';
import TinyBookingTable from '../components/TinyBookingTable';
import { bookingsFetcher } from '../lib/fetchers';
import {
    createdSortFn,
    IsBookingDraftOrBooked,
    IsBookingOut,
    IsBookingUpcomingRental,
    onlyUniqueById,
} from '../lib/utils';
import { formatDatetime, toBookingViewModel } from '../lib/datetimeUtils';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { IfNotReadonly } from '../components/utils/IfAdmin';
import TableStyleLink from '../components/utils/TableStyleLink';
import { KeyValue } from '../models/interfaces/KeyValue';
import CurrentlyOutEquipment from '../components/CurrentlyOutEquipment';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const IndexPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: bookings } = useSwr('/api/bookings', bookingsFetcher);
    const { data: myBookings } = useSwr('/api/users/' + currentUser.userId + '/bookings', bookingsFetcher);
    const { data: coOwnerBookings } = useSwr('/api/users/' + currentUser.userId + '/coOwnerBookings', bookingsFetcher);

    const myDraftOrBookedBookings = myBookings?.map(toBookingViewModel).filter(IsBookingDraftOrBooked);
    const upcomingRentalBookings = bookings?.map(toBookingViewModel).filter(IsBookingUpcomingRental);
    const outBookings = bookings?.map(toBookingViewModel).filter(IsBookingOut);

    const changelog = [...(myBookings ?? []), ...(coOwnerBookings ?? [])]
        .filter(onlyUniqueById)
        .flatMap((booking) =>
            (booking.changelog ?? []).map((entry) => ({ ...entry, bookingId: booking.id, bookingName: booking.name })),
        )
        .sort(createdSortFn)
        .slice(0, 15);

    return (
        <Layout title="Hem" fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title="Backstage2" breadcrumbs={[]}></Header>
            <Row className="mb-3">
                <Col xl={6}>
                    <TinyBookingTable title="Mina bokningar" bookings={myDraftOrBookedBookings}>
                        <IfNotReadonly currentUser={currentUser}>
                            <Link href="/bookings/new" passHref>
                                <Button variant="secondary" as="span" className="mr-2 ml-2 mb-2">
                                    <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till bokning
                                </Button>
                            </Link>
                        </IfNotReadonly>
                    </TinyBookingTable>
                    <TinyBookingTable
                        title="Mina favoritbokningar"
                        bookings={coOwnerBookings}
                        tableSettingsOverride={{ defaultSortAscending: false }}
                    ></TinyBookingTable>
                </Col>
                <Col xl={6}>
                    <TinyBookingTable
                        title="Kommande hyror (inom 24h)"
                        bookings={upcomingRentalBookings}
                        showDateHeadings={false}
                    ></TinyBookingTable>
                    <TinyBookingTable
                        title="Utlämnade hyror"
                        bookings={outBookings}
                        showDateHeadings={false}
                    ></TinyBookingTable>
                    <CurrentlyOutEquipment />
                    <Card className="mb-3">
                        <Card.Header className="d-flex">
                            <span className="flex-grow-1">Aktivitet</span>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {changelog.slice(0, 15).map((changelogEntry) => (
                                <ListGroup.Item key={changelogEntry.id}>
                                    <div className="mb-1">
                                        <TableStyleLink href={'/bookings/' + changelogEntry.bookingId}>
                                            {changelogEntry.bookingName}
                                        </TableStyleLink>
                                    </div>
                                    <div className="mb-1 text-muted">{changelogEntry.name}</div>
                                    <div className="text-muted">
                                        {changelogEntry.updated ? formatDatetime(changelogEntry.updated) : 'N/A'}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default IndexPage;
