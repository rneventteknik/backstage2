import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Alert, Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
import { getResponseContentOrError } from '../../lib/utils';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IEquipmentObjectionModel } from '../../models/objection-models';
import { toEquipment } from '../../lib/mappers/equipment';
import EquipmentForm from '../../components/equipment/EquipmentForm';
import { useNotifications } from '../../lib/useNotifications';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const staticPageTitle = 'Utrusning';
const staticBreadcrumbs = [{ link: 'equipment', displayName: staticPageTitle }];

const EquipmentPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Edit equipment
    //
    const router = useRouter();
    const { data: equipment, error, isValidating, mutate } = useSwr('/api/equipment/' + router.query.id, fetcher);

    if (!equipment && !error && isValidating) {
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

    if (error || !equipment) {
        return (
            <Layout title={staticPageTitle} breadcrumbs={staticBreadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {staticPageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Ogiltig utrustning
                </Alert>
            </Layout>
        );
    }

    const handleSubmit = async (equipment: IEquipmentObjectionModel) => {
        const body = { equipment: equipment };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/equipment/' + router.query.id, request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
            .then(toEquipment)
            .then((equipment) => {
                mutate(equipment, false);
                showSaveSuccessNotification('Utrustningen');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Utrustningen');
            });
    };

    // Delete equipment handler
    //
    const deleteEquipment = () => {
        setShowDeleteModal(false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/equipment/' + equipment?.id, request)
            .then(getResponseContentOrError)
            .then(() => router.push('/equipment/'))
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Utrustningen kunde inte tas bort');
            });
    };

    // The page itself
    //
    const pageTitle = equipment?.name;
    const breadcrumbs = [
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipment/' + equipment.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <div className="float-right">
                <Button variant="primary" form="editEquipmentForm" type="submit">
                    Spara utrustning
                </Button>
                <DropdownButton
                    id="dropdown-basic-button"
                    className="d-inline-block ml-2"
                    variant="secondary"
                    title="Mer"
                >
                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        Ta bort utrustning
                    </Dropdown.Item>
                </DropdownButton>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            <EquipmentForm equipment={equipment} handleSubmitEquipment={handleSubmit} formId="editEquipmentForm" />

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bekräfta</Modal.Title>
                </Modal.Header>
                <Modal.Body> Vill du verkligen ta bort utrustningen {equipment.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="danger" onClick={() => deleteEquipment()}>
                        Ta bort
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
};

const fetcher = (url: string) =>
    fetch(url)
        .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
        .then(toEquipment);

export default EquipmentPage;
