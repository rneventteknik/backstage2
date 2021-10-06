import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Alert, Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import ActivityIndicator from '../../../components/utils/ActivityIndicator';
import { getMemberStatusName, getResponseContentOrError, getRoleName } from '../../../lib/utils';
import { toUser } from '../../../lib/mappers/user';
import { IUserObjectionModel } from '../../../models/objection-models/UserObjectionModel';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import { IEventObjectionModel } from '../../../models/objection-models';
import { toEvent } from '../../../lib/mappers/event';
import Link from 'next/link';
import SmallEventList from '../../../components/SmallEventList';
import UserDisplay from '../../../components/utils/UserDisplay';
import { IfAdmin } from '../../../components/utils/IfAdmin';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const staticPageTitle = 'Användare';
const staticBreadcrumbs = [{ link: 'users', displayName: staticPageTitle }];

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit user
    //
    const router = useRouter();
    const { data: user, error, isValidating } = useSwr('/api/users/' + router.query.id, fetcher);
    const { data: events } = useSwr('/api/users/' + router.query.id + '/events', eventsFetcher);

    if (!user && !error && isValidating) {
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

    if (error || !user) {
        return (
            <Layout title={staticPageTitle} breadcrumbs={staticBreadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {staticPageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Ogiltig användare
                </Alert>
            </Layout>
        );
    }

    // The page itself
    //
    const pageTitle = user?.name;
    const breadcrumbs = [
        { link: '/users', displayName: 'Användare' },
        { link: '/users/' + user.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <IfAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
                <div className="float-right">
                    <Link href={'/users/' + user.id + '/edit'}>
                        <Button variant="primary" href={'/users/' + user.id + '/edit'}>
                            Redigera
                        </Button>
                    </Link>
                </div>
            </IfAdmin>
            <h1> {pageTitle} </h1>
            <hr />

            <Row className="mb-3">
                <Col xl={4}>
                    <Card className="mb-3">
                        <Card.Header style={{ fontSize: '1.6em' }}>
                            <UserDisplay user={user} />
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Namn</span>
                                <span>{user.name}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Medlemsstatus</span>
                                <span>{getMemberStatusName(user.memberStatus)}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Tagg</span>
                                <span>{user.nameTag}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Email</span>
                                <span>{user.emailAddress}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Telefonnummer</span>
                                <span>{user.phoneNumber}</span>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <IfAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
                        <Card className="mb-3">
                            <Card.Header>
                                <div>Inloggningsuppgifter</div>
                            </Card.Header>
                            {user.username ? (
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Behörighet</span>
                                        <span>{getRoleName(user.role)}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Användarnamn</span>
                                        <span>{user.username}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                            ) : (
                                <ListGroup.Item className="text-center font-italic text-muted">
                                    Inloggningsuppgifter är inte konfigurerade
                                </ListGroup.Item>
                            )}
                        </Card>

                        <Card className="mb-3">
                            <Card.Header>
                                <div>Bankuppgifter</div>
                                <div className="text-muted">Endast synligt för dig och admins.</div>
                            </Card.Header>
                            {user.personalIdentityNumber ||
                            user.bankAccount ||
                            user.clearingNumber ||
                            user.bankName ||
                            user.homeAddress ||
                            user.zipCode ? (
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Personnummer</span>
                                        <span>{user.personalIdentityNumber}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Bankkonto</span>
                                        <span>{user.bankAccount}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Clearingnummer</span>
                                        <span>{user.clearingNumber}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Banknamn</span>
                                        <span>{user.bankName}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Hemadress</span>
                                        <span>{user.homeAddress}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex">
                                        <span className="flex-grow-1">Postnummer</span>
                                        <span>{user.zipCode}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                            ) : (
                                <ListGroup.Item className="text-center font-italic text-muted">
                                    Bankuppgifter är inte konfigurerade
                                </ListGroup.Item>
                            )}
                        </Card>
                    </IfAdmin>
                </Col>

                <Col xl={8}>
                    <SmallEventList title="Bokningar" events={events}></SmallEventList>
                </Col>
            </Row>
        </Layout>
    );
};

const fetcher = (url: string) =>
    fetch(url)
        .then((apiResponse) => getResponseContentOrError<IUserObjectionModel>(apiResponse))
        .then(toUser);

const eventsFetcher = (url: string) =>
    fetch(url)
        .then((apiResponse) => getResponseContentOrError<IEventObjectionModel[]>(apiResponse))
        .then((objectionModels) => objectionModels.map(toEvent));

export default UserPage;
