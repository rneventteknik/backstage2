import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { getResponseContentOrError } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import { IEquipmentPackageObjectionModel } from '../../../models/objection-models';
import { useNotifications } from '../../../lib/useNotifications';
import { toEquipmentPackage } from '../../../lib/mappers/equipmentPackage';
import EquipmentPackageForm from '../../../components/equipmentPackage/EquipmentPackageForm';
import { equipmentPackageFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { FormLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import Header from '../../../components/layout/Header';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

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

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !equipmentPackage) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} />;
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
                router.push('/equipmentPackage/' + equipmentPackage.id);
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
        { link: '/equipmentPackage', displayName: 'Utrustning' },
        { link: '/equipmentPackage', displayName: 'Utrustningspaket' },
        { link: '/equipmentPackage/' + equipmentPackage.id, displayName: pageTitle },
        { link: '/equipmentPackage/' + equipmentPackage.id + '/edit', displayName: 'Redigera' },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
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
            </Header>

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
