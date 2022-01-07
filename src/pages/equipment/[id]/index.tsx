import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Alert, Badge, Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import ActivityIndicator from '../../../components/utils/ActivityIndicator';
import { formatPrice, formatTHSPrice } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import Link from 'next/link';
import { IfNotReadonly } from '../../../components/utils/IfAdmin';
import { equipmentFetcher } from '../../../lib/fetchers';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const staticPageTitle = 'Utrustning';
const staticBreadcrumbs = [{ link: 'equipment', displayName: staticPageTitle }];

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit user
    //
    const router = useRouter();
    const { data: equipment, error, isValidating } = useSwr('/api/equipment/' + router.query.id, equipmentFetcher);

    if (!equipment && !error && isValidating) {
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

    if (error || !equipment) {
        return (
            <Layout title={staticPageTitle} breadcrumbs={staticBreadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {staticPageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Ogiltig utrustning
                </Alert>
            </Layout>
        );
    }

    // The page itself
    //
    const pageTitle = equipment?.name;
    const breadcrumbs = [
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipment/' + equipment.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <IfNotReadonly currentUser={currentUser}>
                <div className="float-right">
                    <Link href={'/equipment/' + equipment.id + '/edit'}>
                        <Button variant="primary" href={'/equipment/' + equipment.id + '/edit'}>
                            Redigera
                        </Button>
                    </Link>
                </div>
            </IfNotReadonly>
            <h1> {pageTitle} </h1>
            <hr />

            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>
                            <div style={{ fontSize: '1.6em' }}>{equipment.name}</div>
                            <div>
                                {equipment.categories.map((x) => (
                                    <Badge variant="dark" key={x.id} className="mr-1">
                                        {x.name}
                                    </Badge>
                                ))}
                            </div>
                            <div className="text-muted mt-2">{equipment.description}</div>
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Namn</span>
                                <span>{equipment.name}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Engelskt namn</span>
                                <span>{equipment.nameEN}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Antal</span>
                                <span>{equipment.inventoryCount}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Synlig i publika prislistan</span>
                                <span>{equipment.publiclyHidden ? 'Nej' : 'Ja'}</span>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Beskrivning</div>
                                <div className="text-muted">{equipment.description}</div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Engelsk beskrivning</div>
                                <div className="text-muted">{equipment.descriptionEN}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header>Prissättning</Card.Header>
                        <ListGroup variant="flush">
                            {equipment.prices.map((p) => (
                                <ListGroup.Item key={p.id} className="d-flex">
                                    <span className="flex-grow-1">
                                        {p.name}
                                        <br />
                                        <span className="text-muted">{p.name} (THS)</span>
                                    </span>
                                    <span>
                                        {formatPrice(p)} <br /> <span className="text-muted">{formatTHSPrice(p)}</span>
                                    </span>
                                </ListGroup.Item>
                            ))}

                            {equipment.prices?.length === 0 ? (
                                <ListGroup.Item className="text-center font-italic text-muted">
                                    Inga priser är konfigurerade
                                </ListGroup.Item>
                            ) : null}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default UserPage;
