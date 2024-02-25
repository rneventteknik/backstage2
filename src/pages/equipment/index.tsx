import React from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import Link from 'next/link';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import {
    faAdd,
    faArchive,
    faCalendarXmark,
    faCubes,
    faFileExport,
    faFileImport,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/layout/Header';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { equipmentsFetcher } from '../../lib/fetchers';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { IfAdmin, IfNotReadonly } from '../../components/utils/IfAdmin';
import { KeyValue } from '../../models/interfaces/KeyValue';
import LargeEquipmentTable from '../../components/LargeEquipmentTable';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Utrustning';
const breadcrumbs = [{ link: 'equipment', displayName: pageTitle }];

const EquipmentListPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: equipment, error } = useSwr('/api/equipment', equipmentsFetcher);

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

    if (!equipment) {
        return <TableLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <IfNotReadonly currentUser={currentUser}>
                    <Link href="/equipment/new" passHref>
                        <Button variant="primary" as="span">
                            <FontAwesomeIcon icon={faAdd} className="mr-1" /> Lägg till utrustning
                        </Button>
                    </Link>
                </IfNotReadonly>
                <Link href="/equipmentPackage" passHref>
                    <Button variant="secondary" as="span">
                        <FontAwesomeIcon icon={faCubes} className="mr-1" /> Visa utrustningspaket
                    </Button>
                </Link>
                <DropdownButton id="mer-dropdown-button" variant="secondary" title="Mer" className="d-inline-block">
                    <Link href="/equipment/compare-availability" passHref legacyBehavior>
                        <Dropdown.Item href={'/equipment/compare-availability'}>
                            <FontAwesomeIcon icon={faCalendarXmark} className="mr-1 fa-fw" /> Jämför tillgänglighet
                        </Dropdown.Item>
                    </Link>
                    <Link href="/equipment/archived" passHref legacyBehavior>
                        <Dropdown.Item href={'/equipment/archived'}>
                            <FontAwesomeIcon icon={faArchive} className="mr-1 fa-fw" /> Visa arkiverad utrustning
                        </Dropdown.Item>
                    </Link>
                    <IfAdmin currentUser={currentUser}>
                        <Dropdown.Divider />
                        <Link href="/equipment/json-import" passHref legacyBehavior>
                            <Dropdown.Item href={'/equipment/json-import'}>
                                <FontAwesomeIcon icon={faFileImport} className="mr-1 fa-fw" /> Importera utrustning från
                                JSON
                            </Dropdown.Item>
                        </Link>
                        <Link href="/equipment/json-export" passHref legacyBehavior>
                            <Dropdown.Item href={'/equipment/json-export'}>
                                <FontAwesomeIcon icon={faFileExport} className="mr-1 fa-fw" /> Exportera utrustning till
                                JSON
                            </Dropdown.Item>
                        </Link>
                    </IfAdmin>
                </DropdownButton>
            </Header>
            <LargeEquipmentTable equipment={equipment} />
        </Layout>
    );
};

export default EquipmentListPage;
