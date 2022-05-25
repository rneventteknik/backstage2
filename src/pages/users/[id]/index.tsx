import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { getMemberStatusName, getRoleName } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import Link from 'next/link';
import SmallBookingList from '../../../components/SmallBookingList';
import UserDisplay from '../../../components/utils/UserDisplay';
import { IfAdmin } from '../../../components/utils/IfAdmin';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { bookingsFetcher, userFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    // Edit user
    //
    const router = useRouter();
    const { data: user, error, isValidating } = useSwr('/api/users/' + router.query.id, userFetcher);
    const { data: bookings } = useSwr('/api/users/' + router.query.id + '/bookings', bookingsFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !user) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser} />;
    }

    // The page itself
    //
    const pageTitle = user?.name;
    const breadcrumbs = [
        { link: '/users', displayName: 'Användare' },
        { link: '/users/' + user.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
                    <Link href={'/users/' + user.id + '/edit'} passHref>
                        <Button variant="primary" href={'/users/' + user.id + '/edit'}>
                            <FontAwesomeIcon icon={faPen} className="mr-1" /> Redigera
                        </Button>
                    </Link>
                </IfAdmin>
            </Header>

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
                    <SmallBookingList title="Bokningar" bookings={bookings}></SmallBookingList>
                </Col>
            </Row>
        </Layout>
    );
};

export default UserPage;
