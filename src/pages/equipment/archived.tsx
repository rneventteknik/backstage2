import React from 'react';
import Layout from '../../components/layout/Layout';
import { Equipment } from '../../models/interfaces';
import useSwr from 'swr';
import { TableDisplay, TableConfiguration } from '../../components/TableDisplay';
import { Badge } from '../ui/Badge';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/layout/Header';
import { TableLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { equipmentsFetcher } from '../../lib/fetchers';
import TableStyleLink from '../../components/utils/TableStyleLink';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { formatDatetimeForForm } from '../../lib/datetimeUtils';
import { KeyValue } from '../../models/interfaces/KeyValue';

const EquipmentNameDisplayFn = (equipment: Equipment) => (
    <>
        <TableStyleLink href={'/equipment/' + equipment.id}>{equipment.name}</TableStyleLink>
        <Badge variant="warning" className="mr-1 ml-1">
            Arkiverad
        </Badge>
        {equipment.publiclyHidden ? (
            <span className="small text-muted ml-1">
                <FontAwesomeIcon icon={faEyeSlash} title="Gömd i den publika prislistan"></FontAwesomeIcon>
            </span>
        ) : null}
        {equipment.tags.map((x) => (
            <Badge variant="dark" key={x.id} className="ml-1">
                {x.name}
            </Badge>
        ))}
        <div className="text-muted mb-0">{equipment.description}</div>
    </>
);

const tableSettings: TableConfiguration<Equipment> = {
    entityTypeDisplayName: '',
    defaultSortPropertyName: 'name',
    defaultSortAscending: true,
    columns: [
        {
            key: 'name',
            displayName: 'Utrustning',
            getValue: (equipment: Equipment) => equipment.name + ' ' + equipment.description,
            getContentOverride: EquipmentNameDisplayFn,
        },
        {
            key: 'updated',
            displayName: 'Senast ändrad',
            getValue: (equipment: Equipment) => formatDatetimeForForm(equipment.updated),
        },
        {
            key: 'created',
            displayName: 'Skapad',
            getValue: (equipment: Equipment) => formatDatetimeForForm(equipment.created),
        },
    ],
};

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Arkiverad utrustning';
const breadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: '/equipment/archived', displayName: pageTitle },
];

const EquipmentListPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const { data: equipment, error } = useSwr('/api/equipment/archived', equipmentsFetcher);

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
            <Header title={pageTitle} breadcrumbs={breadcrumbs} />
            <TableDisplay entities={equipment} configuration={tableSettings} />
        </Layout>
    );
};

export default EquipmentListPage;
