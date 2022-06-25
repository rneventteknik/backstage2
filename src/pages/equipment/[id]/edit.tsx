import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton, Modal } from 'react-bootstrap';
import { getResponseContentOrError } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../../lib/useUser';
import { IEquipmentObjectionModel } from '../../../models/objection-models';
import { toEquipment } from '../../../lib/mappers/equipment';
import EquipmentForm from '../../../components/equipment/EquipmentForm';
import { useNotifications } from '../../../lib/useNotifications';
import Header from '../../../components/layout/Header';
import { FormLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import { equipmentFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { PartialDeep } from 'type-fest';
import { Role } from '../../../models/enums/Role';
import { faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.USER);
type Props = { user: CurrentUserInfo };

const EquipmentPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Edit equipment
    //
    const router = useRouter();
    const {
        data: equipment,
        error,
        isValidating,
        mutate,
    } = useSwr('/api/equipment/' + router.query.id, equipmentFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !equipment) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} />;
    }

    const handleSubmit = async (equipment: PartialDeep<IEquipmentObjectionModel>) => {
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
                router.push('/equipment/' + equipment.id);
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
        { link: '/equipment/' + equipment.id + '/edit', displayName: 'Redigera' },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editEquipmentForm" type="submit">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Spara utrustning
                </Button>
                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort utrustning
                    </Dropdown.Item>
                </DropdownButton>
            </Header>

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

export default EquipmentPage;
