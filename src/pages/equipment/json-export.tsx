import React from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import { Card, Form } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import Header from '../../components/layout/Header';
import { TextLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { equipmentsFetcher } from '../../lib/fetchers';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { Role } from '../../models/enums/Role';
import { KeyValue } from '../../models/interfaces/KeyValue';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.ADMIN);
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Exportera Utrustning';
const breadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: '/equipment/json-export', displayName: pageTitle },
];

const EquipmentJsonExportPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => {
    const {
        data: equipment,
        error,
        isValidating,
    } = useSwr('/api/equipment', equipmentsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    // Error handling of equipment list from server
    //
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
        return <TextLoadingPage fixedWidth={false} currentUser={currentUser} globalSettings={globalSettings} />;
    }

    // Generate export json
    //
    const equipmentForExport = equipment.map((x) => ({
        ...x,

        // Set string properties
        equipmentPublicCategoryName: x.equipmentPublicCategory?.name,
        equipmentLocationName: x.equipmentLocation?.name,
        equipmentTagNames: x.tags.map((t) => t.name),

        // Set undefined for properties we do not export
        equipmentPublicCategory: undefined,
        equipmentLocation: undefined,
        tags: undefined,
        changelog: undefined,
        equipmentPackageId: undefined,
        equipmentLocationId: undefined,
        equipmentPublicCategoryId: undefined,
        imageId: undefined,
        created: undefined,
        updated: undefined,
        id: undefined,

        // Set prices
        prices: x.prices.map((p) => ({
            ...p,
            created: undefined,
            updated: undefined,
            equipmentId: undefined,
            id: undefined,
        })),
    }));
    const json = JSON.stringify(equipmentForExport);

    return (
        <Layout title={pageTitle} currentUser={currentUser} globalSettings={globalSettings}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs} />

            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex">
                        <div className="flex-grow-1 mr-4">Export</div>
                    </div>
                </Card.Header>
                <Card.Body>JSON-koden nedan kan importeras i en annan instans av Backstage2.</Card.Body>
            </Card>

            <Form.Group controlId="formDescriptionEN">
                <Form.Label>JSON</Form.Label>
                <Form.Control as="textarea" rows={10} name="json" defaultValue={json} readOnly />
            </Form.Group>
        </Layout>
    );
};

export default EquipmentJsonExportPage;
