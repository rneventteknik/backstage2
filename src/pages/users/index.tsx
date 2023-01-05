import React from 'react';
import Layout from '../../components/layout/Layout';
import { User } from '../../models/interfaces';
import useSwr from 'swr';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { getMemberStatusName, getRoleName } from '../../lib/utils';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { IfAdmin } from '../../components/utils/IfAdmin';
import { faAdd, faBan, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/layout/Header';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { usersFetcher } from '../../lib/fetchers';
import TableStyleLink from '../../components/utils/TableStyleLink';
import { ErrorPage } from '../../components/layout/ErrorPage';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo };
const pageTitle = 'Användare';
const breadcrumbs = [{ link: 'users', displayName: pageTitle }];

const UserListPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: users, error, isValidating } = useSwr('/api/users', usersFetcher);

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !users) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} />;
    }

    const UserNameDisplayFn = (user: User) => (
        <>
            <TableStyleLink href={'users/' + user.id}>{user.name}</TableStyleLink>
            <IfAdmin or={currentUser.userId === user.id} currentUser={currentUser}>
                {!user.username ? (
                    <span className="small text-muted ml-1">
                        <FontAwesomeIcon icon={faBan} title="Har inte inloggninguppgifter"></FontAwesomeIcon>
                    </span>
                ) : null}
            </IfAdmin>
            <div className="text-muted mb-0">
                <span className="d-lg-none">
                    {user?.emailAddress ?? 'N/A'}
                    <IfAdmin currentUser={currentUser}>, </IfAdmin>
                </span>
                <IfAdmin currentUser={currentUser}>{getRoleName(user?.role)}</IfAdmin>
            </div>
            <div className="text-muted mb-0 d-md-none">{getMemberStatusName(user?.memberStatus)}</div>
        </>
    );

    const tableSettings: TableConfiguration<User> = {
        entityTypeDisplayName: 'användare',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        columns: [
            {
                key: 'name',
                displayName: 'Användare',
                getValue: (user: User) => [user.name, user?.emailAddress].join(' '),
                getContentOverride: UserNameDisplayFn,
            },
            {
                key: 'nameTag',
                displayName: 'Tagg',
                getValue: (user: User) => user.nameTag,
                textAlignment: 'center',
            },
            {
                key: 'email',
                displayName: 'Email',
                getValue: (user: User) => user.emailAddress ?? '-',
                textAlignment: 'center',
                cellHideSize: 'lg',
            },
            {
                key: 'role',
                displayName: 'Medlemsstatus',
                getValue: (user: User) => getMemberStatusName(user?.memberStatus),
                textAlignment: 'center',
                columnWidth: 180,
                cellHideSize: 'md',
            },
        ],
    };

    return (
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfAdmin currentUser={currentUser}>
                    <Link href="/users/new" passHref>
                        <Button variant="primary" as="span">
                            <FontAwesomeIcon icon={faAdd} /> Skapa användare
                        </Button>
                    </Link>
                </IfAdmin>
                <Link href={'users/' + currentUser.userId} passHref>
                    <Button variant="secondary" as="span">
                        <FontAwesomeIcon icon={faUser} className="mr-1" /> Visa min profil
                    </Button>
                </Link>
            </Header>

            {users && users.length > 0 ? (
                <TableDisplay entities={users} configuration={tableSettings} />
            ) : (
                <span>Det finns inga användare att visa.</span>
            )}
        </Layout>
    );
};

export default UserListPage;
