import React from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import UserForm from '../../components/users/UserForm';
import { User } from '../../models/interfaces';
import { getResponseContentOrError } from '../../lib/utils';
import { IUserObjectionModel } from '../../models/objection-models/UserObjectionModel';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import Header from '../../components/layout/Header';
import { Role } from '../../models/enums/Role';
import { useNotifications } from '../../lib/useNotifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.ADMIN);
type Props = { user: CurrentUserInfo };

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny användare';
    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    const breadcrumbs = [
        { link: '/users', displayName: 'Users' },
        { link: '/users/new', displayName: pageTitle },
    ];

    const handleSubmit = async (user: IUserObjectionModel) => {
        const body = { user: user };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/users', request)
            .then((apiResponse) => getResponseContentOrError<User>(apiResponse))
            .then((data) => {
                router.push('/users/' + data.id);
                showCreateSuccessNotification('Användaren');
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Användaren');
            });
    };

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editUserForm" type="submit">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Lägg till användare
                </Button>
            </Header>

            <UserForm handleSubmitUser={handleSubmit} formId="editUserForm" />
        </Layout>
    );
};

export default UserPage;
