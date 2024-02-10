import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { getResponseContentOrError } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
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
import { faBoxesPacking, faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConfirmModal from '../../../components/utils/ConfirmModal';
import { KeyValue } from '../../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.USER);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const EquipmentPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);

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
        return (
            <ErrorPage
                errorMessage={error.message}
                fixedWidth={true}
                currentUser={currentUser}
                globalSettings={globalSettings}
            />
        );
    }

    if (isValidating || !equipment) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
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

    // Archive-equipment handler
    //
    const setArchiveStatusForEquipment = (status: boolean) => {
        setShowDeleteModal(false);

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipment: { id: equipment.id, name: equipment.name, isArchived: status } }),
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

    // Delete-equipment handler
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
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editEquipmentForm" type="submit">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Spara utrustning
                </Button>
                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                    {equipment.isArchived ? (
                        <Dropdown.Item onClick={() => setShowUnarchiveModal(true)} className="text-warning">
                            <FontAwesomeIcon icon={faBoxesPacking} className="mr-1 fa-fw" />
                            Avarkivera utrustning
                        </Dropdown.Item>
                    ) : (
                        <Dropdown.Item onClick={() => setShowArchiveModal(true)} className="text-warning">
                            <FontAwesomeIcon icon={faBoxesPacking} className="mr-1 fa-fw" />
                            Arkivera utrustning
                        </Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" />
                        Ta bort utrustning
                    </Dropdown.Item>
                </DropdownButton>
            </Header>

            <EquipmentForm equipment={equipment} handleSubmitEquipment={handleSubmit} formId="editEquipmentForm" />

            <ConfirmModal
                show={showArchiveModal}
                onHide={() => setShowArchiveModal(false)}
                onConfirm={() => {
                    setShowArchiveModal(false);
                    setArchiveStatusForEquipment(true);
                }}
                title="Bekräfta"
                confirmLabel="Arkivera"
            >
                Vill du verkligen arkivera utrustningen {equipment.name}?
            </ConfirmModal>

            <ConfirmModal
                show={showUnarchiveModal}
                onHide={() => setShowUnarchiveModal(false)}
                onConfirm={() => {
                    setShowUnarchiveModal(false);
                    setArchiveStatusForEquipment(false);
                }}
                title="Bekräfta"
            >
                Vill du verkligen markera utrustningen {equipment.name} som inte längre arkiverad?
            </ConfirmModal>

            <ConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    setShowDeleteModal(false);
                    deleteEquipment();
                }}
                title="Bekräfta"
                confirmLabel="Ta bort"
            >
                Vill du verkligen arkivera utrustningen {equipment.name}?
            </ConfirmModal>
        </Layout>
    );
};

export default EquipmentPage;
