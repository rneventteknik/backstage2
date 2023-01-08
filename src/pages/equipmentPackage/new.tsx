import React from 'react';
import Layout from '../../components/layout/Layout';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { IEquipmentPackageObjectionModel } from '../../models/objection-models';
import { toEquipmentPackage } from '../../lib/mappers/equipmentPackage';
import EquipmentPackageForm from '../../components/equipmentPackage/EquipmentPackageForm';
import { getResponseContentOrError } from '../../lib/utils';
import Header from '../../components/layout/Header';
import { PartialDeep } from 'type-fest';
import { Role } from '../../models/enums/Role';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { KeyValue } from '../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.USER);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };

const EquipmentPackagePage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
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
        <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button variant="primary" form="editEquipmentPackageForm" type="submit">
                    <FontAwesomeIcon icon={faSave} className="mr-1" /> Lägg till utrustningspaket
                </Button>
            </Header>

            <EquipmentPackageForm handleSubmitEquipmentPackage={handleSubmit} formId="editEquipmentPackageForm" />
        </Layout>
    );
};

export default EquipmentPackagePage;
