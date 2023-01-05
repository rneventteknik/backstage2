import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Badge, Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import Link from 'next/link';
import { IfNotReadonly } from '../../../components/utils/IfAdmin';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { equipmentPackageFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { faCoins, faEyeSlash, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo };

const EquipmentPackagePage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const {
        data: equipmentPackage,
        error,
        isValidating,
    } = useSwr('/api/equipmentPackage/' + router.query.id, equipmentPackageFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !equipmentPackage) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser} />;
    }

    // The page itself
    //
    const pageTitle = equipmentPackage?.name;
    const breadcrumbs = [
        { link: '/equipmentPackage', displayName: 'Utrustning' },
        { link: '/equipmentPackage', displayName: 'Utrustningspaket' },
        { link: '/equipmentPackage/' + equipmentPackage.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href={'/equipmentPackage/' + equipmentPackage.id + '/edit'} passHref>
                        <Button variant="primary" href={'/equipmentPackage/' + equipmentPackage.id + '/edit'}>
                            <FontAwesomeIcon icon={faPen} className="mr-1" /> Redigera
                        </Button>
                    </Link>
                </IfNotReadonly>
            </Header>

            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header>
                            <div style={{ fontSize: '1.6em' }}>{equipmentPackage.name}</div>
                            <div>
                                {equipmentPackage.tags.map((x) => (
                                    <Badge variant="dark" key={x.id} className="mr-1">
                                        {x.name}
                                    </Badge>
                                ))}
                            </div>
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Namn</span>
                                <span>{equipmentPackage.name}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Engelskt namn</span>
                                <span>{equipmentPackage.nameEN}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Estimerade timmar</span>
                                <span>{equipmentPackage.estimatedHours} timmar</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Pakettyp</span>
                                <span>
                                    {equipmentPackage.addAsHeading ? 'Rubrik med rader' : 'Individuellta rader'}
                                </span>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Beskrivning</div>
                                <div className="text-muted">{equipmentPackage.description}</div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="mb-1">Engelsk beskrivning</div>
                                <div className="text-muted">{equipmentPackage.descriptionEN}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col xl={8}>
                    <Card className="mb-3">
                        <Card.Header>Utrustning</Card.Header>
                        <ListGroup variant="flush">
                            {equipmentPackage.equipmentEntries.map((e) => (
                                <ListGroup.Item key={e.id} className="d-flex">
                                    <span className="flex-grow-1">
                                        {e.equipment?.name}
                                        <br />
                                        <span className="text-muted">{e.equipment?.description}</span>
                                    </span>
                                    <span>
                                        {e.isHidden ? (
                                            <FontAwesomeIcon icon={faEyeSlash} className="mr-1" title="Gömd för kund" />
                                        ) : null}
                                        {e.isFree ? (
                                            <FontAwesomeIcon icon={faCoins} className="mr-1" title="Utan pris" />
                                        ) : null}
                                        {e.numberOfUnits} st
                                    </span>
                                </ListGroup.Item>
                            ))}

                            {equipmentPackage.equipmentEntries?.length === 0 ? (
                                <ListGroup.Item className="text-center font-italic text-muted">
                                    Det här paketet har ingen utrustning
                                </ListGroup.Item>
                            ) : null}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default EquipmentPackagePage;
