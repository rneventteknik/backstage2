import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import { Button, Card, Form, ProgressBar } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { faExclamationCircle, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/layout/Header';
import { TextLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { equipmentsFetcher } from '../../lib/fetchers';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { Role } from '../../models/enums/Role';
import { getResponseContentOrError } from '../../lib/utils';
import { useNotifications } from '../../lib/useNotifications';
import { PartialDeep } from 'type-fest';
import { IEquipmentObjectionModel } from '../../models/objection-models';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl(Role.ADMIN);
type Props = { user: CurrentUserInfo };
const pageTitle = 'Importera Utrustning';
const breadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: '/equipment/json-import', displayName: pageTitle },
];

const EquipmentJsonImportPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const { data: equipment, error, isValidating } = useSwr('/api/equipment', equipmentsFetcher);
    const [json, setJson] = useState('');
    const [numberOfImportedEquipments, setNumberOfImportedEquipments] = useState(0);
    const { showCreateSuccessNotification, showCreateFailedNotification } = useNotifications();

    // Error handling of equipment list from server
    //
    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }

    if (isValidating || !equipment) {
        return <TextLoadingPage fixedWidth={false} currentUser={currentUser} />;
    }

    // Parse JSON
    //
    let equipmentInJson: Partial<IEquipmentObjectionModel>[] | null = null;
    let equipmentToImport: Partial<IEquipmentObjectionModel>[] = [];
    let modelsAreValid: boolean | null = null;
    let jsonError: string | null = null;

    try {
        equipmentInJson = JSON.parse(json);
        equipmentToImport =
            equipmentInJson
                ?.filter((x) => !equipment.some((y) => y.name === x.name))
                .map((equipment) => ({
                    name: equipment.name,
                    nameEN: equipment.nameEN,
                    description: equipment.description ?? '',
                    descriptionEN: equipment.descriptionEN ?? '',
                    inventoryCount: equipment.inventoryCount ?? 1,
                    note: equipment.note ?? '',
                    publiclyHidden: equipment.publiclyHidden ?? false,
                    equipmentPublicCategoryId: equipment.equipmentPublicCategoryId ?? undefined,
                    equipmentPublicCategory: undefined,
                    tags: [],
                    changeLog: [],
                    prices:
                        equipment.prices?.map((price) => ({
                            name: price.name,
                            pricePerUnit: price.pricePerUnit ?? 0,
                            pricePerHour: price.pricePerHour ?? 0,
                            pricePerUnitTHS: price.pricePerUnitTHS ?? 0,
                            pricePerHourTHS: price.pricePerHourTHS ?? 0,
                        })) ?? [],
                })) ?? [];
        modelsAreValid = !equipmentToImport?.some((x) => !x.name || !x.nameEN || x.inventoryCount === undefined);

        // After the import is done swr will fetch the new list of equipment, and all the imported equipment will be duplicates. When that happens, this code will reset the number of imported products.
        if (numberOfImportedEquipments > equipmentToImport.length) {
            setNumberOfImportedEquipments(0);
        }

        if (!equipmentInJson) {
            jsonError = 'Ogiltig Json';
        }
    } catch {
        jsonError = 'Ogiltig Json';
    }

    // Import logic
    //
    const importEquipment = async (equipmentToImport: Partial<IEquipmentObjectionModel>[]) => {
        let counter = 0;
        for (const equipment of equipmentToImport) {
            counter++;
            setNumberOfImportedEquipments(counter);
            await addEquipment(equipment); // Await is used to import one equipment at a time
        }
    };

    const addEquipment = async (equipment: PartialDeep<IEquipmentObjectionModel>) => {
        // The product adding is done in two steps. First, use a POST request to add the equipment.
        const addRequest = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipment: equipment }),
        };

        return fetch('/api/equipment', addRequest)
            .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
            .then((data) => {
                // Second, use a PUT request to add children (i.e. prices)
                const updateRequest = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ equipment: equipment }),
                };

                return fetch('/api/equipment/' + data.id, updateRequest)
                    .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
                    .then((data) => {
                        showCreateSuccessNotification(data.name);
                    })
                    .catch((error: Error) => {
                        console.error(error);
                        showCreateFailedNotification(equipment.name ?? 'Utrustningen');
                    });
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification(equipment.name ?? 'Utrustningen');
            });
    };

    return (
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button
                    variant="primary"
                    disabled={!modelsAreValid || equipmentToImport.length == 0}
                    onClick={() => importEquipment(equipmentToImport)}
                >
                    <FontAwesomeIcon icon={faFileImport} className="mr-1" /> Importera
                </Button>
            </Header>

            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex">
                        <div className="flex-grow-1 mr-4">Status</div>
                    </div>
                </Card.Header>
                <Card.Body>
                    {jsonError && json.length === 0 ? <p>Fyll i JSON nedan för att börja.</p> : null}

                    {jsonError && json.length > 0 ? (
                        <p className="text-danger">
                            <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att tolka JSON.
                        </p>
                    ) : null}

                    {!jsonError && numberOfImportedEquipments === 0 ? (
                        <>
                            <p>
                                Utrustning att importera: {equipmentToImport?.length} st (
                                {(equipmentInJson?.length ?? 0) - equipmentToImport?.length} st finns redan och har
                                ignorerats)
                            </p>
                            <p>
                                Valideringsstatus:{' '}
                                {modelsAreValid ? <span>Ok</span> : <span className="text-danger">Felaktig</span>}
                            </p>
                        </>
                    ) : null}

                    {!jsonError && numberOfImportedEquipments > 0 ? (
                        <>
                            <p>
                                Equipments imported: {numberOfImportedEquipments} / {equipmentToImport?.length}
                            </p>
                            <ProgressBar now={(numberOfImportedEquipments / equipmentToImport.length) * 100} />
                        </>
                    ) : null}
                </Card.Body>
            </Card>

            <Form.Group controlId="formDescriptionEN">
                <Form.Label>JSON</Form.Label>
                <Form.Control
                    as="textarea"
                    placeholder="[{...}]"
                    name="json"
                    onChange={(e) => setJson(e.target.value)}
                    defaultValue={json}
                />
            </Form.Group>
        </Layout>
    );
};

export default EquipmentJsonImportPage;
