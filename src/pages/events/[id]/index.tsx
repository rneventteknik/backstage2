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
import EventTypeTag from '../../../components/utils/EventTypeTag';
import { eventFetcher } from '../../../lib/fetchers';
import TimeEstimateList from '../../../components/timeEstimate/TimeEstimateList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import EquipmentLists from '../../../components/events/equipmentLists/EquipmentLists';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const EventPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit event
    //
    const router = useRouter();
    const { data: event, error } = useSwr('/api/events/' + router.query.id, eventFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (!event) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser}></TwoColLoadingPage>;
    }

    // The page itself
    //
    const pageTitle = event?.name;
    const breadcrumbs = [
        { link: '/events', displayName: 'Bokningar' },
        { link: '/events/' + event.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href={'/events/' + event.id + '/edit'}>
                        <Button variant="primary" href={'/events/' + event.id + '/edit'} className="mr-2">
                            Redigera
                        </Button>
                    </Link>
                </IfNotReadonly>
                <Dropdown as={ButtonGroup}>
                    <Button variant="dark" href={'/api/documents/price-estimate/se/' + event.id} target="_blank">
                        <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Prisuppskattning
                    </Button>

                    <Dropdown.Toggle split variant="dark" id="dropdown-split-basic" />

                    <Dropdown.Menu>
                        <Dropdown.Item href={'/api/documents/price-estimate/en/' + event.id} target="_blank">
                            <FontAwesomeIcon icon={faFileDownload} className="m-1" /> Prisuppskattning (engelska)
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Header>

            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>
                            <div style={{ fontSize: '1.6em' }}>{event.name}</div>
                            <EventTypeTag event={event} />
                            <Badge variant="dark" className="ml-1">
                                {getStatusName(event.status)}
                            </Badge>
                            <div className="text-muted mt-2">{event.customerName}</div>
                        </Card.Header>

                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Namn</span>
                                <span>{event.name}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Beställare</span>
                                <span>{event.customerName}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Plats</span>
                                <span>{event.location}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Ansvarig</span>
                                <span>{event.ownerUser?.name ?? '-'}</span>
                            </ListGroup.Item>
                            {/* <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">coOwnerUsers</span>
                                <span>{event.coOwnerUsers}</span>
                            </ListGroup.Item> */}
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Prisplan</span>
                                <span>{getPricePlanName(event.pricePlan)}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kontaktperson</span>
                                <span>{event.contactPersonName}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Telefonnummer</span>
                                <span>{event.contactPersonPhone}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Email</span>
                                <span>{event.contactPersonEmail}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header>Fakturainformation</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Fakturaadress</span>
                                <span>{event.invoiceAddress}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Fakturamärkning</span>
                                <span>{event.invoiceTag}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Hogia-id</span>
                                <span>{event.invoiceHogiaId}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Kontotyp</span>
                                <span>{getAccountKindName(event.accountKind)}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header>Anteckningar</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <div className="mb-1">Anteckning</div>
                                <div className="text-muted">{event.note}</div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Återlämningsanmärkning</div>
                                <div className="text-muted">{event.returnalNote}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col xl={8}>
                    <TimeEstimateList eventId={event.id} pricePlan={event.pricePlan} />
                    <EquipmentLists event={event} />
                </Col>
            </Row>
        </Layout>
    );
};

export default EventPage;
