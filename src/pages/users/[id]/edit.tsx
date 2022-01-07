import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Alert, Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import UserForm from '../../../components/users/UserForm';
import ActivityIndicator from '../../../components/utils/ActivityIndicator';
import { getResponseContentOrError } from '../../../lib/utils';
import UserAuthForm from '../../../components/users/UserAuthForm';
import { UpdateAuthRequest, UpdateAuthResponse } from '../../../models/misc/UpdateAuthApiModels';
import { toUser } from '../../../lib/mappers/user';
import { useNotifications } from '../../../lib/useNotifications';
import { IUserObjectionModel } from '../../../models/objection-models/UserObjectionModel';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import { IfAdmin } from '../../../components/utils/IfAdmin';
import { Role } from '../../../models/enums/Role';
import { userFetcher } from '../../../lib/fetchers';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const staticPageTitle = 'Användare';
const staticBreadcrumbs = [
    { link: '/users', displayName: staticPageTitle },
    { link: '/users', displayName: 'Redigera' },
];

const UserPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteAuthModal, setShowDeleteAuthModal] = useState(false);
    const [showEditAuthModal, setShowEditAuthModal] = useState(false);

    const {
        showSaveSuccessNotification,
        showSaveFailedNotification,
        showGeneralDangerMessage,
        showGeneralSuccessMessage,
    } = useNotifications();

    // Edit user
    //
    const router = useRouter();
    const { data: user, error, isValidating, mutate } = useSwr('/api/users/' + router.query.id, userFetcher);

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

    const handleSubmit = async (user: IUserObjectionModel) => {
        const body = { user: user };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/users/' + router.query.id, request)
            .then((apiResponse) => getResponseContentOrError<IUserObjectionModel>(apiResponse))
            .then(toUser)
            .then((user) => {
                mutate(user, false);
                showSaveSuccessNotification('Användaren');
                router.push('/users/' + user.id);
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Användaren');
            });
    };

    // Delete user handler
    //
    const deleteUser = () => {
        setShowDeleteModal(false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/users/' + user?.id, request)
            .then(getResponseContentOrError)
            .then(() => router.push('/users/'))
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Användaren kunde inte tas bort');
            });
    };

    // Change-password handler
    //
    const handleUpdateAuth = async (changePasswordRequest: UpdateAuthRequest) => {
        const body = { changePasswordRequest: changePasswordRequest };
        const request = {
            method: user.username ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/users/userauth/' + router.query.id, request)
            .then((response) => getResponseContentOrError<UpdateAuthResponse>(response))
            .then((data) => {
                mutate({ ...user, username: data.username }, false);
                showSaveSuccessNotification('Inloggningsuppgifterna');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Inloggningsuppgifterna');
            })
            .finally(() => setShowEditAuthModal(false));
    };

    // Delete user auth
    //
    const deleteUserAuth = () => {
        setShowDeleteAuthModal(false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/users/userauth/' + user?.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                mutate({ ...user, username: undefined }, false);
                showGeneralSuccessMessage('Borttagna', 'Inloggningsuppgifter borttagna');
            })
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Inloggningsuppgifterna kunde inte tas bort');
            });
    };

    // The page itself
    //
    const pageTitle = user?.name;
    const breadcrumbs = [
        { link: '/users', displayName: 'Användare' },
        { link: '/users/' + user.id, displayName: pageTitle },
        { link: '/users/' + user.id + '/edit', displayName: 'Redigera' },
    ];

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <div className="float-right">
                <Button variant="primary" form="editUserForm" type="submit">
                    Spara användare
                </Button>
                <DropdownButton
                    id="dropdown-basic-button"
                    className="d-inline-block ml-2"
                    variant="secondary"
                    title="Mer"
                >
                    {user.username ? (
                        <>
                            <Dropdown.Item onClick={() => setShowEditAuthModal(true)}>
                                Redigera inloggningsuppgifter
                            </Dropdown.Item>
                            <IfAdmin and={currentUser.userId !== user.id} currentUser={currentUser}>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => setShowDeleteAuthModal(true)} className="text-danger">
                                    Ta bort inloggningsuppgifter
                                </Dropdown.Item>
                            </IfAdmin>
                        </>
                    ) : (
                        <>
                            <IfAdmin currentUser={currentUser}>
                                <Dropdown.Item onClick={() => setShowEditAuthModal(true)}>
                                    Skapa inloggningsuppgifter
                                </Dropdown.Item>
                                <Dropdown.Divider />
                            </IfAdmin>
                        </>
                    )}
                    <IfAdmin and={currentUser.userId !== user.id} currentUser={currentUser}>
                        <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                            Ta bort användare
                        </Dropdown.Item>
                    </IfAdmin>
                </DropdownButton>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            <UserForm user={user} handleSubmitUser={handleSubmit} formId="editUserForm" />

            {/* Here comes the three modals used on this page */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bekräfta</Modal.Title>
                </Modal.Header>
                <Modal.Body> Vill du verkligen ta bort användaren {user.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="danger" onClick={() => deleteUser()}>
                        Ta bort
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteAuthModal} onHide={() => setShowDeleteAuthModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bekräfta</Modal.Title>
                </Modal.Header>
                <Modal.Body> Vill du verkligen ta bort inloggningsuppgifterna för användaren {user.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDeleteAuthModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="danger" onClick={() => deleteUserAuth()}>
                        Ta bort
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditAuthModal} onHide={() => setShowEditAuthModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{user.username ? 'Redigera inloggningsuppgifter' : 'Skapa inloggning'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UserAuthForm
                        formId="editUserAuthForm"
                        handleSubmit={handleUpdateAuth}
                        userId={user.id}
                        previousUserName={user?.username}
                        previousRole={user?.role}
                        hideRoleInput={currentUser.role != Role.ADMIN}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShowEditAuthModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="primary" form="editUserAuthForm" type="submit">
                        Spara inloggningsuppgifter
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
};

export default UserPage;
