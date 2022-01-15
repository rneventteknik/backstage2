import React from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IEquipmentObjectionModel } from '../../models/objection-models';
import { toEquipment } from '../../lib/mappers/equipment';
import EquipmentForm from '../../components/equipment/EquipmentForm';
import { getResponseContentOrError } from '../../lib/utils';
import { useNotifications } from '../../lib/useNotifications';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const EquipmentPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Ny utrustning';
    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    const breadcrumbs = [
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipment/new', displayName: pageTitle },
    ];

    const handleSubmit = async (equipment: IEquipmentObjectionModel) => {
        const body = { equipment: equipment };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/equipment', request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
            .then(toEquipment)
            .then((data) => {
                router.push('/equipment/' + data.id);
                showCreateSuccessNotification('Utrustningen');
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Utrustningen');
            });
    };

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <div className="float-right">
                <Button variant="primary" form="editEquipmentForm" type="submit">
                    Lägg till utrustning
                </Button>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            <EquipmentForm handleSubmitEquipment={handleSubmit} formId="editEquipmentForm" />
        </Layout>
    );
};

export default EquipmentPage;
