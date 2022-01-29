import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Alert, Badge, Button, ButtonGroup, Card, Col, Dropdown, ListGroup, Row } from 'react-bootstrap';
import ActivityIndicator from '../../../components/utils/ActivityIndicator';
import { getAccountKindName, getPricePlanName, getStatusName } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import Link from 'next/link';
import { IfNotReadonly } from '../../../components/utils/IfAdmin';
import EventTypeTag from '../../../components/utils/EventTypeTag';
import { eventFetcher } from '../../../lib/fetchers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const staticPageTitle = 'Bokning';
const staticBreadcrumbs = [{ link: 'event', displayName: staticPageTitle }];

const EventPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit event
    //
    const router = useRouter();
    const { data: event, error, isValidating } = useSwr('/api/events/' + router.query.id, eventFetcher);

    if (!event && !error && isValidating) {
        return (
            <Layout title={staticPageTitle} breadcrumbs={staticBreadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {staticPageTitle} </h1>
                <hr />
                <div className="text-center py-5">
                    <ActivityIndicator />
                </div>
            </Layout>
        );
    }

    if (error || !event) {
        return (
            <Layout title={staticPageTitle} breadcrumbs={staticBreadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {staticPageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Ogiltig bokning
                </Alert>
            </Layout>
        );
    }

    // The page itself
    //
    const pageTitle = event?.name;
    const breadcrumbs = [
        { link: '/events', displayName: 'Bokning' },
        { link: '/events/' + event.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <IfNotReadonly currentUser={currentUser}>
                <div className="float-right">
                    <Link href={'/events/' + event.id + '/edit'}>
                        <Button variant="primary" href={'/events/' + event.id + '/edit'}>
                            Redigera
                        </Button>
                    </Link>
                    <Dropdown as={ButtonGroup} className="ml-2">
                        <Button variant="primary" href={'/api/documents/price-estimate/se/' + event.id} target="_blank">
                            <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Prisuppskattning
                        </Button>

                        <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />

                        <Dropdown.Menu align="right">
                            <Dropdown.Item href={'/api/documents/price-estimate/en/' + event.id} target="_blank">
                                <FontAwesomeIcon icon={faFileDownload} className="mr-1" /> Prisuppskattning (engelska)
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </IfNotReadonly>
            <h1> {pageTitle} </h1>
            <hr />

            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>
                            <div style={{ fontSize: '1.6em' }}>{event.name}</div>
                            <EventTypeTag event={event} />
                            <Badge variant="dark" className="ml-1">
                                {getStatusName(event.status)}
                            </Badge>
                            <div className="text-muted mt-2">{event.location}</div>
                        </Card.Header>

                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Namn</span>
                                <span>{event.name}</span>
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
            </Row>
        </Layout>
    );
};

export default EventPage;
