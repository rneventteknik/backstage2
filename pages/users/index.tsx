import React from 'react';
import Layout from '../../components/Layout';
import { User } from '../../interfaces';
import useSwr from 'swr';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { formatDate, getMemberStatusName, getRoleName, getResponseContentOrError } from '../../lib/utils';
import Link from 'next/link';
import { Alert, Button } from 'react-bootstrap';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
import { UserApiModel } from '../../interfaces/api-models';
import { toUser } from '../../lib/mappers/user';
import { CurrentUserInfo } from '../../interfaces/auth/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';

const UserNameDisplayFn = (user: User) => <Link href={'users/' + user.id}>{user.name}</Link>;
const UserActionsDisplayFn = (event: User) => <Link href={'users/' + event.id}>Redigera</Link>;

const tableSettings: TableConfiguration<User> = {
    entityTypeDisplayName: 'användare',
    defaultSortPropertyName: 'date',
    defaultSortAscending: false,
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
            key: 'nameTag',
            displayName: 'Tagg',
            getValue: (user: User) => user.nameTag,
            textAlignment: 'center',
            columnWidth: 80,
        },
        {
            key: 'canNotLogIn',
            displayName: 'Avaktiverad',
            getValue: (user: User) => (!user.username ? '✓' : ''),
            textAlignment: 'center',
            columnWidth: 80,
        },
        {
            key: 'status',
            displayName: 'Medlemsstatus',
            getValue: (user: User) => getMemberStatusName(user?.memberStatus),
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'role',
            displayName: 'Behörighet',
            getValue: (user: User) => getRoleName(user?.role),
            textAlignment: 'center',
            columnWidth: 180,
        },
        {
            key: 'date',
            displayName: 'Datum',
            getValue: (User: User) => (User.created ? formatDate(new Date(User.created)) : '-'),
            columnWidth: 180,
            textAlignment: 'center',
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
        .then((apiResponse) => getResponseContentOrError<UserApiModel[]>(apiResponse))
        .then((apiModel) => apiModel.map((x) => toUser(x)));

export default UserListPage;
