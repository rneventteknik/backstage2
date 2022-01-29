import React from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { IEquipmentPackageObjectionModel } from '../../models/objection-models';
import { toEquipmentPackage } from '../../lib/mappers/equipmentPackage';
import EquipmentPackageForm from '../../components/equipmentPackage/EquipmentPackageForm';
import { getResponseContentOrError } from '../../lib/utils';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const EquipmentPackagePage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const router = useRouter();
    const pageTitle = 'Nytt utrustningspaket';

    const breadcrumbs = [
        { link: '/equipment', displayName: 'Utrustning' },
        { link: '/equipmentPackage', displayName: 'Utrustningspaket' },
        { link: '/equipmentPackage/new', displayName: pageTitle },
    ];

    const handleSubmit = async (equipmentPackage: IEquipmentPackageObjectionModel) => {
        const body = { equipmentPackage: equipmentPackage };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/equipmentPackage', request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentPackageObjectionModel>(apiResponse))
            .then(toEquipmentPackage)
            .then((data) => {
                router.push('/equipmentPackage/' + data.id);
            });
    };

    return (
        <Layout title={pageTitle} breadcrumbs={breadcrumbs} fixedWidth={true} currentUser={currentUser}>
            <div className="float-right">
                <Button variant="primary" form="editEquipmentPackageForm" type="submit">
                    Lägg till utrustningspaket
                </Button>
            </div>
            <h1> {pageTitle} </h1>
            <hr />

            <EquipmentPackageForm handleSubmitEquipmentPackage={handleSubmit} formId="editEquipmentPackageForm" />
        </Layout>
    );
};

export default EquipmentPackagePage;
