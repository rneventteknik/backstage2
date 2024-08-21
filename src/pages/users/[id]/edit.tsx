import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import UserForm from '../../../components/users/UserForm';
import { getResponseContentOrError } from '../../../lib/utils';
import UserAuthForm from '../../../components/users/UserAuthForm';
import { UpdateAuthRequest, UpdateAuthResponse } from '../../../models/misc/UpdateAuthApiModels';
import { toUser } from '../../../lib/mappers/user';
import { useNotifications } from '../../../lib/useNotifications';
import { IUserObjectionModel } from '../../../models/objection-models/UserObjectionModel';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import { IfAdmin, IfNotAdmin } from '../../../components/utils/IfAdmin';
import { Role } from '../../../models/enums/Role';
import Header from '../../../components/layout/Header';
import { FormLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { userFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { faKey, faLock, faSave, faTrashCan, faUserPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConfirmModal from '../../../components/utils/ConfirmModal';
import { KeyValue } from '../../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const UserPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
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
    const {
        data: user,
        error,
        isValidating,
        mutate,
    } = useSwr('/api/users/' + router.query.id, userFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

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

    if (isValidating || !user) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
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
                setShowEditAuthModal(false);
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Inloggningsuppgifterna');
            });
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
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editUserForm" type="submit">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Spara användare
                </Button>

                <IfNotAdmin currentUser={currentUser}>
                    <Button variant="secondary" onClick={() => setShowEditAuthModal(true)}>
                        <FontAwesomeIcon icon={faUserPen} className="mr-1 fa-fw" /> Redigera inloggningsuppgifter
                    </Button>
                </IfNotAdmin>

                <IfAdmin currentUser={currentUser}>
                    <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                        {user.username ? (
                            <>
                                <Dropdown.Item onClick={() => setShowEditAuthModal(true)}>
                                    <FontAwesomeIcon icon={faUserPen} className="mr-1 fa-fw" /> Redigera
                                    inloggningsuppgifter
                                </Dropdown.Item>
                                <IfAdmin and={currentUser.userId !== user.id} currentUser={currentUser}>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={() => setShowDeleteAuthModal(true)} className="text-danger">
                                        <FontAwesomeIcon icon={faLock} className="mr-1 fa-fw" /> Ta bort
                                        inloggningsuppgifter
                                    </Dropdown.Item>
                                </IfAdmin>
                            </>
                        ) : (
                            <>
                                <Dropdown.Item onClick={() => setShowEditAuthModal(true)}>
                                    <FontAwesomeIcon icon={faKey} className="mr-1 fa-fw" /> Skapa inloggningsuppgifter
                                </Dropdown.Item>
                                <Dropdown.Divider />
                            </>
                        )}
                        <IfAdmin and={currentUser.userId !== user.id} currentUser={currentUser}>
                            <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                                <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort användare
                            </Dropdown.Item>
                        </IfAdmin>
                    </DropdownButton>
                </IfAdmin>
            </Header>

            <UserForm user={user} handleSubmitUser={handleSubmit} formId="editUserForm" />

            {/* Here comes the three modals used on this page */}

            <ConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Bekräfta"
                confirmLabel="Ta bort"
                onConfirm={deleteUser}
            >
                Vill du verkligen ta bort användaren {user.name}?
            </ConfirmModal>

            <ConfirmModal
                show={showDeleteAuthModal}
                onHide={() => setShowDeleteAuthModal(false)}
                title="Bekräfta"
                confirmLabel="Ta bort"
                onConfirm={deleteUserAuth}
            >
                Vill du verkligen ta bort inloggningsuppgifterna för användaren {user.name}?
            </ConfirmModal>

            <Modal show={showEditAuthModal} onHide={() => setShowEditAuthModal(false)} backdrop="static">
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
                    <Button variant="secondary" onClick={() => setShowEditAuthModal(false)}>
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
