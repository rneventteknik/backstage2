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
import Header from '../../components/layout/Header';
import { PartialDeep } from 'type-fest';

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

    const handleSubmit = async (equipmentPackage: PartialDeep<IEquipmentPackageObjectionModel>) => {
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
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editEquipmentPackageForm" type="submit">
                    Lägg till utrustningspaket
                </Button>
            </Header>

            <EquipmentPackageForm handleSubmitEquipmentPackage={handleSubmit} formId="editEquipmentPackageForm" />
        </Layout>
    );
};

export default EquipmentPackagePage;
