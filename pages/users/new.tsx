import React from 'react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import UserForm from '../../components/users/UserForm';
import { User } from '../../interfaces';
import { handleApiResonse } from '../../lib/utils';
import { IUserApiModel } from '../../interfaces/api-models/UserApiModel';
import { CurrentUserInfo } from '../../interfaces/auth/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny användare';

    const breadcrumbs = [
        { link: '/users', displayName: 'Users' },
        { link: '/users/new', displayName: pageTitle },
    ];

    const handleSubmit = async (user: IUserApiModel) => {
        const body = { user: user };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/users', request)
            .then(handleApiResonse)
            .then((data) => data as User)
            .then((data) => {
                router.push('/users/' + data.id);
            });
    };

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <div className="float-right">
                <Button variant="primary" form="editUserForm" type="submit">
                    Lägg till användare
                </Button>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            <UserForm handleSubmitUser={handleSubmit} formId="editUserForm" />
        </Layout>
    );
};

export default UserPage;
