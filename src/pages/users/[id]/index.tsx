import React from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ListGroup } from '../../../components/ui/ListGroup';
import { getMemberStatusName, getRoleName } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import UserDisplay from '../../../components/utils/UserDisplay';
import { IfAdmin } from '../../../components/utils/IfAdmin';
import Header from '../../../components/layout/Header';
import { TwoColLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { bookingsFetcher, userFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { faPen, faStopwatch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TinyBookingTable from '../../../components/TinyBookingTable';
import { KeyValue } from '../../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const UserPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    // Edit user
    //
    const router = useRouter();
    const { data: user, error } = useSwr('/api/users/' + router.query.id, userFetcher);
    const { data: bookings } = useSwr('/api/users/' + router.query.id + '/bookings', bookingsFetcher);
    const { data: coOwnerBookings } = useSwr('/api/users/' + router.query.id + '/coOwnerBookings', bookingsFetcher);

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

    if (!user) {
        return <TwoColLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    // The page itself
    //
    const pageTitle = user?.name;
    const breadcrumbs = [
        { link: '/users', displayName: 'Användare' },
        { link: '/users/' + user.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
                    <Button variant="primary" href={'/users/' + user.id + '/edit'}>
                        <FontAwesomeIcon icon={faPen} className="mr-1" /> Redigera
                    </Button>
                </IfAdmin>
                <Button variant="secondary" href={'/users/' + user.id + '/time-reports'}>
                    <FontAwesomeIcon icon={faStopwatch} className="mr-1" /> Visa tidrapporter
                </Button>
            </Header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-3">
                <div className="xl:col-span-4">
                    <Card className="mb-3">
                        <Card.Header style={{ fontSize: '1.6em' }}>
                            <UserDisplay user={user} />
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="flex">
                                <span className="flex-grow">Namn</span>
                                <span>{user.name}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="flex">
                                <span className="flex-grow">Medlemsstatus</span>
                                <span>{getMemberStatusName(user.memberStatus)}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="flex">
                                <span className="flex-grow">Tagg</span>
                                <span>{user.nameTag}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="flex">
                                <span className="flex-grow">Email</span>
                                <span>{user.emailAddress}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="flex">
                                <span className="flex-grow">Telefonnummer</span>
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
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Behörighet</span>
                                        <span>{getRoleName(user.role)}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Användarnamn</span>
                                        <span>{user.username}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                            ) : (
                                <ListGroup.Item className="text-center italic text-muted">
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
                            user.homeAddress ? (
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Personnummer</span>
                                        <span>{user.personalIdentityNumber}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Bankkonto</span>
                                        <span>{user.bankAccount}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Clearingnummer</span>
                                        <span>{user.clearingNumber}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="flex">
                                        <span className="flex-grow">Banknamn</span>
                                        <span>{user.bankName}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <div className="mb-1">Adress</div>
                                        <div className="text-muted">
                                            {user.homeAddress
                                                ?.split('\n')
                                                .map((addressLine, i) => <div key={i}>{addressLine}</div>)}
                                        </div>
                                    </ListGroup.Item>
                                </ListGroup>
                            ) : (
                                <ListGroup.Item className="text-center italic text-muted">
                                    Bankuppgifter är inte konfigurerade
                                </ListGroup.Item>
                            )}
                        </Card>
                    </IfAdmin>
                </div>

                <div className="xl:col-span-8">
                    <TinyBookingTable
                        title="Bokningar"
                        bookings={bookings}
                        tableSettingsOverride={{ defaultSortAscending: false }}
                    ></TinyBookingTable>
                    <TinyBookingTable
                        title="Favoritbokningar"
                        bookings={coOwnerBookings}
                        tableSettingsOverride={{ defaultSortAscending: false }}
                    ></TinyBookingTable>
                </div>
            </div>
        </Layout>
    );
};

export default UserPage;
