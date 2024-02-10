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
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import MarkdownCard from '../../../components/MarkdownCard';
import { getResponseContentOrError } from '../../../lib/utils';
import { PartialDeep } from 'type-fest';
import { IEquipmentPackageObjectionModel } from '../../../models/objection-models';
import { useNotifications } from '../../../lib/useNotifications';
import { toEquipmentPackage } from '../../../lib/mappers/equipmentPackage';
import PackageEquipmentList from '../../../components/equipmentPackage/PackageEquipmentList';
import { Role } from '../../../models/enums/Role';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const EquipmentPackagePage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const router = useRouter();
    const {
        data: equipmentPackage,
        error,
        mutate,
    } = useSwr('/api/equipmentPackage/' + router.query.id, equipmentPackageFetcher);

    const { showSaveSuccessNotification, showSaveFailedNotification } = useNotifications();

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

    if (!equipmentPackage) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    const handleSubmit = async (equipmentPackage: PartialDeep<IEquipmentPackageObjectionModel>) => {
        const body = { equipmentPackage: equipmentPackage };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/equipmentPackage/' + router.query.id, request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentPackageObjectionModel>(apiResponse))
            .then(toEquipmentPackage)
            .then((equipmentPackage) => {
                mutate(equipmentPackage, false);
                showSaveSuccessNotification('Utrustningspaketet');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Utrustningspaketet');
            });
    };

    // The page itself
    //
    const pageTitle = equipmentPackage?.name;
    const breadcrumbs = [
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipmentPackage', displayName: 'Utrustningspaket' },
        { link: '/equipmentPackage/' + equipmentPackage.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
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
                                <span className="flex-grow-1">Estimerad arbetstid</span>
                                <span>{equipmentPackage.estimatedHours} timmar</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Pakettyp</span>
                                <span>{equipmentPackage.addAsHeading ? 'Rubrik med rader' : 'Individuella rader'}</span>
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
                    <MarkdownCard
                        text={equipmentPackage.note}
                        onSubmit={(x) => handleSubmit({ name: equipmentPackage.name, note: x })}
                        cardTitle={'Anteckningar'}
                        readonly={currentUser.role === Role.READONLY}
                    />
                    <Card className="mb-3">
                        <Card.Header>Utrustning</Card.Header>
                        <PackageEquipmentList equipmentPackage={equipmentPackage} />
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default EquipmentPackagePage;
