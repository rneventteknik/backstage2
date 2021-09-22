import React from 'react';
import Layout from '../../components/layout/Layout';
import { User } from '../../models/interfaces';
import useSwr from 'swr';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { getMemberStatusName, getRoleName, getResponseContentOrError } from '../../lib/utils';
import Link from 'next/link';
import { Alert, Button } from 'react-bootstrap';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
import { UserObjectionModel } from '../../models/objection-models';
import { toUser } from '../../lib/mappers/user';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IfAdmin, IfNotAdmin } from '../../components/utils/IfAdmin';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Användare';
const breadcrumbs = [{ link: 'users', displayName: pageTitle }];

const UserListPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: users, error, isValidating } = useSwr('/api/users', fetcher);
    if (!users && !error && isValidating) {
        return (
            <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {pageTitle} </h1>
                <hr />
                <div className="text-center py-5">
                    <ActivityIndicator />
                </div>
            </Layout>
        );
    }

    if (error || !users) {
        return (
            <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {pageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Användarlistan kunde inte hämtas
                </Alert>
            </Layout>
        );
    }

    const UserNameDisplayFn = (user: User) => (
        <>
            <IfAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
                <Link href={'users/' + user.id}>{user.name}</Link>
                {!user.username ? (
                    <span className="small text-muted ml-1">
                        <FontAwesomeIcon icon={faBan} title="Har inte inloggninguppgifter"></FontAwesomeIcon>
                    </span>
                ) : null}
            </IfAdmin>
            <IfNotAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
                {user.name}
            </IfNotAdmin>
            <p className="text-muted mb-0">{getMemberStatusName(user?.memberStatus)}</p>
        </>
    );
    const UserActionsDisplayFn = (user: User) => (
        <IfAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
            <Link href={'users/' + user.id}>Redigera</Link>
        </IfAdmin>
    );

    const tableSettings: TableConfiguration<User> = {
        entityTypeDisplayName: 'användare',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        columns: [
            {
                key: 'name',
                displayName: 'Användare',
                getValue: (user: User) => user.name,
                getContentOverride: UserNameDisplayFn,
            },
            {
                key: 'email',
                displayName: 'Email',
                getValue: (user: User) => user.emailAddress,
                columnWidth: 280,
            },
            {
                key: 'phone',
                displayName: 'Telefon',
                getValue: (user: User) => user.phoneNumber,
                columnWidth: 280,
            },
            {
                key: 'nameTag',
                displayName: 'Tagg',
                getValue: (user: User) => user.nameTag,
                textAlignment: 'center',
                columnWidth: 80,
            },
            {
                key: 'role',
                displayName: 'Behörighet',
                getValue: (user: User) => getRoleName(user?.role),
                textAlignment: 'center',
                columnWidth: 180,
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                getContentOverride: UserActionsDisplayFn,
                disableSort: true,
                columnWidth: 100,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} currentUser={currentUser}>
            <div className="float-right">
                <Link href="/users/new">
                    <Button variant="primary" as="span">
                        Skapa användare
                    </Button>
                </Link>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            {users && users.length > 0 ? (
                <TableDisplay entities={users} configuration={tableSettings} />
            ) : (
                <span>Det finns inga användare att visa.</span>
            )}
        </Layout>
    );
};

const fetcher = (url: string) =>
    fetch(url)
        .then((apiResponse) => getResponseContentOrError<UserObjectionModel[]>(apiResponse))
        .then((objectionModel) => objectionModel.map((x) => toUser(x)));

export default UserListPage;
