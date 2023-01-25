import React from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IfNotReadonly } from '../../components/utils/IfAdmin';
import Header from '../../components/layout/Header';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { KeyValue } from '../../models/interfaces/KeyValue';
import LargeEquipmentPackageTable from '../../components/LargeEquipmentPackageTable';
import { equipmentPackagesFetcher } from '../../lib/fetchers';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Utrustningspaket';
const breadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: 'equipmentPackage', displayName: pageTitle },
];

const EquipmentPackageListPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: equipmentPackages, error, isValidating } = useSwr('/api/equipmentPackage', equipmentPackagesFetcher);

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

    if (isValidating || !equipmentPackages) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href="/equipmentPackage/new" passHref>
                        <Button variant="primary" as="span">
                            <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till utrustningspaket
                        </Button>
                    </Link>
                </IfNotReadonly>
            </Header>
            <LargeEquipmentPackageTable equipmentPackages={equipmentPackages} />
        </Layout>
    );
};

export default EquipmentPackageListPage;
