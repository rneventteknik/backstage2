import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Alert, Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import ActivityIndicator from '../../components/utils/ActivityIndicator';
import { getResponseContentOrError } from '../../lib/utils';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IEquipmentPackageObjectionModel } from '../../models/objection-models';
import { useNotifications } from '../../lib/useNotifications';
import { toEquipmentPackage } from '../../lib/mappers/equipmentPackage';
import EquipmentPackageForm from '../../components/equipmentPackage/EquipmentPackageForm';
import { equipmentPackageFetcher } from '../../lib/fetchers';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };
const staticPageTitle = 'Utrusning';
const staticBreadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: '/equipmentPackage', displayName: staticPageTitle },
];

const EquipmentPackagePage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Edit equipmentPackage
    //
    const router = useRouter();
    const { data: equipmentPackage, error, isValidating, mutate } = useSwr(
        '/api/equipmentPackage/' + router.query.id,
        equipmentPackageFetcher,
    );

    if (!equipmentPackage && !error && isValidating) {
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

    if (error || !equipmentPackage) {
        return (
            <Layout title={staticPageTitle} breadcrumbs={staticBreadcrumbs} fixedWidth={true} currentUser={currentUser}>
                <h1> {staticPageTitle} </h1>
                <hr />
                <Alert variant="danger">
                    <strong> Fel </strong> Ogiltigt utrustningspaket
                </Alert>
            </Layout>
        );
    }

    const handleSubmit = async (equipmentPackage: IEquipmentPackageObjectionModel) => {
        const body = { equipmentPackage: equipmentPackage };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/equipmentPackage/' + router.query.id, request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentPackageObjectionModel>(apiResponse))
            .then(toEquipmentPackage)
            .then((equipmentPackage) => {
                mutate(equipmentPackage, false);
                showSaveSuccessNotification('Paketet');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Paketet');
            });
    };

    // Delete equipmentPackage handler
    //
    const deleteEquipmentPackage = () => {
        setShowDeleteModal(false);

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/equipmentPackage/' + equipmentPackage?.id, request)
            .then(getResponseContentOrError)
            .then(() => router.push('/equipmentPackage/'))
            .catch((error) => {
                console.error(error);
                showGeneralDangerMessage('Fel!', 'Paketet kunde inte tas bort');
            });
    };

    // The page itself
    //
    const pageTitle = equipmentPackage?.name;
    const breadcrumbs = [
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipmentPackage', displayName: 'Utrustningspaket' },
        { link: '/equipmentPackage/' + equipmentPackage.id, displayName: pageTitle },
    ];

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <div className="float-right">
                <Button variant="primary" form="editEquipmentPackageForm" type="submit">
                    Spara utrustningspaket
                </Button>
                <DropdownButton
                    id="dropdown-basic-button"
                    className="d-inline-block ml-2"
                    variant="secondary"
                    title="Mer"
                >
                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        Ta bort utrustningspaket
                    </Dropdown.Item>
                </DropdownButton>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            <EquipmentPackageForm
                equipmentPackage={equipmentPackage}
                handleSubmitEquipmentPackage={handleSubmit}
                formId="editEquipmentPackageForm"
            />

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bekräfta</Modal.Title>
                </Modal.Header>
                <Modal.Body> Vill du verkligen ta bort utrustningspaketet {equipmentPackage.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="danger" onClick={() => deleteEquipmentPackage()}>
                        Ta bort
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
};

export default EquipmentPackagePage;
