import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { getResponseContentOrError } from '../../../lib/utils';
import { CurrentUserInfo } from '../../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../../lib/useUser';
import { IEquipmentPackageObjectionModel } from '../../../models/objection-models';
import { useNotifications } from '../../../lib/useNotifications';
import { toEquipmentPackage } from '../../../lib/mappers/equipmentPackage';
import EquipmentPackageForm from '../../../components/equipmentPackage/EquipmentPackageForm';
import { equipmentPackageFetcher } from '../../../lib/fetchers';
import { ErrorPage } from '../../../components/layout/ErrorPage';
import { FormLoadingPage } from '../../../components/layout/LoadingPageSkeleton';
import Header from '../../../components/layout/Header';
import { PartialDeep } from 'type-fest';
import { Role } from '../../../models/enums/Role';
import { faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConfirmModal from '../../../components/utils/ConfirmModal';
import { KeyValue } from '../../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.USER);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const EquipmentPackagePage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { showSaveSuccessNotification, showSaveFailedNotification, showGeneralDangerMessage } = useNotifications();

    // Edit equipmentPackage
    //
    const router = useRouter();
    const {
        data: equipmentPackage,
        error,
        isValidating,
        mutate,
    } = useSwr('/api/equipmentPackage/' + router.query.id, equipmentPackageFetcher, {
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

    if (isValidating || !equipmentPackage) {
        return <FormLoadingPage fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    const handleSubmit = async (equipmentPackage: PartialDeep<IEquipmentPackageObjectionModel>) => {
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
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipmentPackage', displayName: 'Utrustningspaket' },
        { link: '/equipmentPackage/' + equipmentPackage.id, displayName: pageTitle },
        { link: '/equipmentPackage/' + equipmentPackage.id + '/edit', displayName: 'Redigera' },
    ];

    return (
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editEquipmentPackageForm" type="submit">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Spara utrustningspaket
                </Button>
                <DropdownButton id="dropdown-basic-button" className="d-inline-block" variant="secondary" title="Mer">
                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                        <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort utrustningspaket
                    </Dropdown.Item>
                </DropdownButton>
            </Header>

            <EquipmentPackageForm
                equipmentPackage={equipmentPackage}
                handleSubmitEquipmentPackage={handleSubmit}
                formId="editEquipmentPackageForm"
            />

            <ConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Bekräfta"
                confirmLabel="Ta bort"
                onConfirm={deleteEquipmentPackage}
            >
                Vill du verkligen ta bort utrustningspaketet {equipmentPackage.name}?
            </ConfirmModal>
        </Layout>
    );
};

export default EquipmentPackagePage;
