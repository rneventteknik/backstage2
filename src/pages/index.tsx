import React from 'react';
import Layout from '../components/layout/Layout';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import Header from '../components/layout/Header';
import { Card, Col, ListGroup, Row } from 'react-bootstrap';
import useSwr from 'swr';
import SmallBookingTable from '../components/SmallBookingTable';
import { bookingsFetcher } from '../lib/fetchers';
import { showActiveBookings, getRoleName } from '../lib/utils';
import { formatDatetime, toBookingViewModel } from '../lib/datetimeUtils';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo };

const IndexPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: bookings } = useSwr('/api/bookings', bookingsFetcher);
    const { data: myBookings } = useSwr('/api/users/' + currentUser.userId + '/bookings', bookingsFetcher);

    const activeBookings = bookings?.map(toBookingViewModel).filter(showActiveBookings);

    const [version, commitId, compileDate] = process.env.NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION?.split('/').map((x) =>
        x.trim(),
    ) ?? ['-', '-', '-'];

    return (
        <Layout title="Hem" fixedWidth={true} currentUser={currentUser}>
            <Header title="Backstage2" breadcrumbs={[]}></Header>
            <Row className="mb-3">
                <Col xl={8}>
                    <SmallBookingTable title="Mina Bokningar" bookings={myBookings}></SmallBookingTable>
                    <SmallBookingTable title="Aktiva bokningar" bookings={activeBookings}></SmallBookingTable>
                </Col>
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>Nuvarande session</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Namn</span>
                                <span>{currentUser.name}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Behörighet</span>
                                <span>{getRoleName(currentUser.role)}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Session startad</span>
                                <span>
                                    {currentUser.loginDate ? formatDatetime(new Date(currentUser.loginDate)) : '-'}
                                </span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <Card className="mb-3">
                        <Card.Header>Backstage2</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Version</span>
                                <span>{version}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Commit id</span>
                                <span>{commitId}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kompileringsdatum</span>
                                <span>{compileDate}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default IndexPage;
