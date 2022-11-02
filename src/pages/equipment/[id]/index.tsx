import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Badge, Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import Link from 'next/link';
import { IfNotReadonly } from '../../../components/utils/IfAdmin';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { equipmentFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { formatPrice, formatTHSPrice } from '../../../lib/pricingUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import EquipmentCalendar from '../../../components/equipment/EquipmentCalendar';
import EquipmentBookings from '../../../components/equipment/EquipmentBookings';
import EquipmentTagDisplay from '../../../components/utils/EquipmentTagDisplay';
import ChangelogCard from '../../../components/ChangelogCard';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit user
    //
    const router = useRouter();
    const { data: equipment, error, isValidating } = useSwr('/api/equipment/' + router.query.id, equipmentFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !equipment) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser} />;
    }

    // The page itself
    //
    const pageTitle = equipment?.name;
    const breadcrumbs = [
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipment/' + equipment.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href={'/equipment/' + equipment.id + '/edit'} passHref>
                        <Button variant="primary" href={'/equipment/' + equipment.id + '/edit'}>
                            <FontAwesomeIcon icon={faPen} className="mr-1" /> Redigera
                        </Button>
                    </Link>
                </IfNotReadonly>
            </Header>

            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>
                            <div style={{ fontSize: '1.6em' }}>
                                {equipment.name}
                                {equipment.isArchived ? (
                                    <Badge variant="warning" className="ml-2">
                                        Arkiverad
                                    </Badge>
                                ) : null}
                            </div>
                            <div>
                                {equipment.tags.map((x) => (
                                    <EquipmentTagDisplay tag={x} key={x.id} className="mr-1" />
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
                                <span>{equipment.inventoryCount ?? '-'}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Plats</span>
                                <span>{equipment.equipmentLocation?.name ?? 'Okänd plats'}</span>
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

                    <ChangelogCard changelog={equipment.changelog ?? []} />
                </Col>
                <Col xl={8}>
                    <EquipmentCalendar equipment={equipment} />
                    <EquipmentBookings equipment={equipment} />
                </Col>
            </Row>
        </Layout>
    );
};

export default UserPage;
