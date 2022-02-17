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
import { equipmentPackageFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit user
    //
    const router = useRouter();
    const { data: equipmentPackage, error, isValidating } = useSwr(
        '/api/equipmentPackage/' + router.query.id,
        equipmentPackageFetcher,
    );

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
                    <Link href={'/equipmentPackage/' + equipmentPackage.id + '/edit'}>
                        <Button variant="primary" href={'/equipmentPackage/' + equipmentPackage.id + '/edit'}>
                            Redigera
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
                                <span className="flex-grow-1">Estimerade timmar</span>
                                <span>{equipmentPackage.estimatedHours} timmar</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

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
                                    <span>{e.numberOfUnits} st</span>
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

export default UserPage;
