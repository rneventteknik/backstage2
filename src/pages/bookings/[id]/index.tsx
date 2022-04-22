import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Badge, Button, ButtonGroup, Card, Col, Dropdown, ListGroup, Row } from 'react-bootstrap';
import { getAccountKindName, getPricePlanName, getStatusName } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import Link from 'next/link';
import { IfNotReadonly } from '../../../components/utils/IfAdmin';
import BookingTypeTag from '../../../components/utils/BookingTypeTag';
import { bookingFetcher } from '../../../lib/fetchers';
import TimeEstimateList from '../../../components/timeEstimate/TimeEstimateList';
import TimeReportList from '../../../components/timeReport/timeReportList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { Role } from '../../../models/enums/Role';
import EquipmentLists from '../../../components/bookings/equipmentLists/EquipmentLists';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const BookingPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit booking
    //
    const router = useRouter();
    const { data: booking, error } = useSwr('/api/bookings/' + router.query.id, bookingFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (!booking) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser}></TwoColLoadingPage>;
    }

    // The page itself
    //
    const pageTitle = booking?.name;
    const breadcrumbs = [
        { link: '/bookings', displayName: 'Bokningar' },
        { link: '/bookings/' + booking.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href={'/bookings/' + booking.id + '/edit'} passHref>
                        <Button variant="primary" href={'/bookings/' + booking.id + '/edit'} className="mr-2">
                            Redigera
                        </Button>
                    </Link>
                </IfNotReadonly>
                <Dropdown as={ButtonGroup}>
                    <Button variant="dark" href={'/api/documents/price-estimate/se/' + booking.id} target="_blank">
                        <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Prisuppskattning
                    </Button>

                    <Dropdown.Toggle split variant="dark" id="dropdown-split-basic" />

                    <Dropdown.Menu>
                        <Dropdown.Item href={'/api/documents/price-estimate/en/' + booking.id} target="_blank">
                            <FontAwesomeIcon icon={faFileDownload} className="m-1" /> Prisuppskattning (engelska)
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Header>

            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>
                            <div style={{ fontSize: '1.6em' }}>{booking.name}</div>
                            <BookingTypeTag booking={booking} />
                            <Badge variant="dark" className="ml-1">
                                {getStatusName(booking.status)}
                            </Badge>
                            <div className="text-muted mt-2">{booking.customerName}</div>
                        </Card.Header>

                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Namn</span>
                                <span>{booking.name}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Beställare</span>
                                <span>{booking.customerName}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Plats</span>
                                <span>{booking.location}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Ansvarig</span>
                                <span>{booking.ownerUser?.name ?? '-'}</span>
                            </ListGroup.Item>
                            {/* <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">coOwnerUsers</span>
                                <span>{booking.coOwnerUsers}</span>
                            </ListGroup.Item> */}
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Prisplan</span>
                                <span>{getPricePlanName(booking.pricePlan)}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kontaktperson</span>
                                <span>{booking.contactPersonName}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Telefonnummer</span>
                                <span>{booking.contactPersonPhone}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Email</span>
                                <span>{booking.contactPersonEmail}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header>Fakturainformation</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Fakturaadress</span>
                                <span>{booking.invoiceAddress}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Fakturamärkning</span>
                                <span>{booking.invoiceTag}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Hogia-id</span>
                                <span>{booking.invoiceHogiaId}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kontotyp</span>
                                <span>{getAccountKindName(booking.accountKind)}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header>Anteckningar</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <div className="mb-1">Anteckning</div>
                                <div className="text-muted">{booking.note}</div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Återlämningsanmärkning</div>
                                <div className="text-muted">{booking.returnalNote}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col xl={8}>
                    <TimeEstimateList
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        readonly={currentUser.role === Role.READONLY}
                    />
                    <TimeReportList
                        bookingId={booking.id}
                        pricePlan={booking.pricePlan}
                        currentUser={currentUser}
                        readonly={currentUser.role === Role.READONLY}
                    />
                    <EquipmentLists booking={booking} readonly={currentUser.role === Role.READONLY} />
                </Col>
            </Row>
        </Layout>
    );
};

export default BookingPage;