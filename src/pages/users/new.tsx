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

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny användare';

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
