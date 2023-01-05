import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import useSwr from 'swr';
import { Button, Card, Form, ProgressBar } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../../lib/useUser';
import { faCheckCircle, faExclamationCircle, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/layout/Header';
import { TextLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import {
    equipmentLocationsFetcher,
    equipmentPublicCategoriesFetcher,
    equipmentsFetcher,
    equipmentTagsFetcher,
} from '../../lib/fetchers';
import { ErrorPage } from '../../components/layout/ErrorPage';
import { Role } from '../../models/enums/Role';
import { getResponseContentOrError, onlyUnique } from '../../lib/utils';
import { useNotifications } from '../../lib/useNotifications';
import { PartialDeep } from 'type-fest';
import { IEquipmentObjectionModel, IEquipmentTagObjectionModel } from '../../models/objection-models';
import {
    IEquipmentLocationObjectionModel,
    IEquipmentPublicCategoryObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { EquipmentPublicCategory, EquipmentTag } from '../../models/interfaces';
import { EquipmentLocation } from '../../models/interfaces/EquipmentLocation';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings(Role.ADMIN);
type Props = { user: CurrentUserInfo };
const pageTitle = 'Importera Utrustning';
const breadcrumbs = [
    { link: '/equipment', displayName: 'Utrustning' },
    { link: '/equipment/json-import', displayName: pageTitle },
];

interface EquipmentImportModel extends IEquipmentObjectionModel {
    equipmentPublicCategoryName?: string;
    equipmentLocationName?: string;
    equipmentTagNames?: string[];
}

const EquipmentJsonImportPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const {
        data: equipment,
        error,
        isValidating,
    } = useSwr('/api/equipment', equipmentsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const {
        data: equipmentTags,
        error: equipmentTagsError,
        isValidating: equipmentTagsIsValidating,
    } = useSwr('/api/equipmentTags', equipmentTagsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const {
        data: equipmentLocations,
        error: equipmentLocationsError,
        isValidating: equipmentLocationsIsValidating,
    } = useSwr('/api/equipmentLocations', equipmentLocationsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const {
        data: equipmentPublicCategories,
        error: equipmentPublicCategoriesError,
        isValidating: equipmentPublicCategoriesIsValidating,
    } = useSwr('/api/equipmentPublicCategories', equipmentPublicCategoriesFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });
    const [json, setJson] = useState('');
    const [numberOfImportedEquipments, setNumberOfImportedEquipments] = useState(0);
    const [numberOfImportedEquipmentTags, setNumberOfImportedEquipmentTags] = useState(0);
    const [numberOfImportedEquipmentLocations, setNumberOfImportedEquipmentLocations] = useState(0);
    const [numberOfImportedEquipmentPublicCategories, setNumberOfImportedEquipmentPublicCategories] = useState(0);
    const [importHasStarted, setImportHasStarted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const { showCreateSuccessNotification, showCreateFailedNotification, showGeneralDangerMessage } =
        useNotifications();

    // Error handling of equipment list from server
    //
    if (error) {
        return <ErrorPage errorMessage={error.message} fixedWidth={true} currentUser={currentUser} />;
    }
    if (equipmentTagsError) {
        return <ErrorPage errorMessage={equipmentTagsError.message} fixedWidth={true} currentUser={currentUser} />;
    }
    if (equipmentLocationsError) {
        return <ErrorPage errorMessage={equipmentLocationsError.message} fixedWidth={true} currentUser={currentUser} />;
    }
    if (equipmentPublicCategoriesError) {
        return (
            <ErrorPage
                errorMessage={equipmentPublicCategoriesError.message}
                fixedWidth={true}
                currentUser={currentUser}
            />
        );
    }

    if (
        isValidating ||
        equipmentTagsIsValidating ||
        equipmentLocationsIsValidating ||
        equipmentPublicCategoriesIsValidating ||
        !equipment
    ) {
        return <TextLoadingPage fixedWidth={false} currentUser={currentUser} />;
    }

    // Parse JSON
    //
    let equipmentInJson: Partial<EquipmentImportModel>[] | null = null;
    let equipmentToImport: Partial<EquipmentImportModel>[] = [];
    let uniqueEquipmentTagNames: string[] = [];
    let uniqueEquipmentLocationNames: string[] = [];
    let uniqueEquipmentPublicCategoryNames: string[] = [];
    let equipmentTagsToImport: Partial<IEquipmentTagObjectionModel>[] = [];
    let equipmentLocationsToImport: Partial<IEquipmentLocationObjectionModel>[] = [];
    let equipmentPublicCategoriesToImport: Partial<IEquipmentPublicCategoryObjectionModel>[] = [];
    let modelsAreValid: boolean | null = null;
    let jsonError: string | null = null;

    try {
        equipmentInJson = JSON.parse(json);
        const filteredEquipment = equipmentInJson?.filter((x) => !equipment.some((y) => y.name === x.name)) ?? [];

        // Tags
        //
        uniqueEquipmentTagNames = filteredEquipment.flatMap((x) => x.equipmentTagNames ?? []).filter(onlyUnique);

        equipmentTagsToImport = uniqueEquipmentTagNames
            .filter((tagName) => !equipmentTags?.some((tag) => tag.name === tagName))
            .map((tagName) => ({ name: tagName }));

        // Locations
        //
        uniqueEquipmentLocationNames = filteredEquipment
            .map((x) => x.equipmentLocationName)
            .filter((x) => !!x)
            .filter(onlyUnique)
            .map((x) => x as string);

        equipmentLocationsToImport = uniqueEquipmentLocationNames
            .filter((locationName) => !equipmentLocations?.some((location) => location.name === locationName))
            .map((tagName) => ({ name: tagName }));

        // Public categories
        //
        uniqueEquipmentPublicCategoryNames = filteredEquipment
            .map((x) => x.equipmentPublicCategoryName)
            .filter((x) => !!x)
            .filter(onlyUnique)
            .map((x) => x as string);

        equipmentPublicCategoriesToImport = uniqueEquipmentPublicCategoryNames
            .filter((categoryName) => !equipmentPublicCategories?.some((category) => category.name === categoryName))
            .map((tagName) => ({ name: tagName }));

        // Equipment
        //
        equipmentToImport = filteredEquipment.map((equipment) => ({
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
            changelog: [],
            prices:
                equipment.prices?.map((price) => ({
                    name: price.name,
                    pricePerUnit: price.pricePerUnit ?? 0,
                    pricePerHour: price.pricePerHour ?? 0,
                    pricePerUnitTHS: price.pricePerUnitTHS ?? 0,
                    pricePerHourTHS: price.pricePerHourTHS ?? 0,
                })) ?? [],
            equipmentPublicCategoryName: equipment.equipmentPublicCategoryName,
            equipmentLocationName: equipment.equipmentLocationName,
            equipmentTagNames: equipment.equipmentTagNames,
        }));
        modelsAreValid = !equipmentToImport?.some((x) => !x.name || !x.nameEN || x.inventoryCount === undefined);

        if (!equipmentInJson) {
            jsonError = 'Ogiltig Json';
        }
    } catch {
        jsonError = 'Ogiltig Json';
    }

    // Import logic
    //
    const importAll = async () => {
        setImportHasStarted(true);

        try {
            // Tags
            //
            for (const equipmentTag of equipmentTagsToImport) {
                setNumberOfImportedEquipmentTags((x) => x + 1);
                await addEquipmentTag(equipmentTag); // Await is used to import one at a time
            }
            const updatedEquipmentTags = await equipmentTagsFetcher('/api/equipmentTags').catch((error: Error) => {
                console.error(error);
                showGeneralDangerMessage('Taggarna kunde inte hämtas');
                throw new Error('Taggarna kunde inte hämtas');
            });

            // Locations
            //
            for (const equipmentLocation of equipmentLocationsToImport) {
                setNumberOfImportedEquipmentLocations((x) => x + 1);
                await addEquipmentLocation(equipmentLocation); // Await is used to import one at a time
            }
            const updatedEquipmentLocations = await equipmentLocationsFetcher('/api/equipmentLocations').catch(
                (error: Error) => {
                    console.error(error);
                    showGeneralDangerMessage('Platserna kunde inte hämtas');
                    throw new Error('Platserna kunde inte hämtas');
                },
            );

            // Public categories
            //
            for (const equipmentPublicCategory of equipmentPublicCategoriesToImport) {
                setNumberOfImportedEquipmentPublicCategories((x) => x + 1);
                await addEquipmentPublicCategory(equipmentPublicCategory); // Await is used to import one at a time
            }
            const updatedEquipmentPublicCategories = await equipmentPublicCategoriesFetcher(
                '/api/equipmentPublicCategories',
            ).catch((error: Error) => {
                console.error(error);
                showGeneralDangerMessage('Publika Kategorierna kunde inte hämtas');
                throw new Error('Publika Kategorierna kunde inte hämtas');
            });

            const equipmentToImportWithAdditionalData = getEquipmentToImportWithAdditionalData(
                updatedEquipmentTags,
                updatedEquipmentLocations,
                updatedEquipmentPublicCategories,
            );

            // Equipment
            //
            for (const equipment of equipmentToImportWithAdditionalData) {
                setNumberOfImportedEquipments((x) => x + 1);
                await addEquipment(equipment); // Await is used to import one at a time
            }

            setDone(true);
        } catch (e) {
            if (!(e instanceof Error)) {
                return;
            }

            setErrorMessage(e.message);
        }
    };

    const getEquipmentToImportWithAdditionalData = (
        equipmentTags: EquipmentTag[],
        equipmentLocations: EquipmentLocation[],
        equipmentPublicCategories: EquipmentPublicCategory[],
    ) =>
        equipmentToImport.map((equipment) => ({
            ...equipment,
            tags: equipment.equipmentTagNames
                ? equipment.equipmentTagNames
                      .map((tagName) => equipmentTags.find((x) => x.name === tagName))
                      .filter((x) => !!x)
                      .map((x) => x as EquipmentTag)
                      .map((x) => ({
                          ...x,
                          created: x.created?.toString(),
                          updated: x.updated?.toString(),
                          equipment: undefined,
                      }))
                : [],
            equipmentLocationId: equipment.equipmentLocationName
                ? equipmentLocations.find((x) => x.name === equipment.equipmentLocationName)?.id
                : undefined,
            equipmentPublicCategoryId: equipment.equipmentPublicCategoryName
                ? equipmentPublicCategories.find((x) => x.name === equipment.equipmentPublicCategoryName)?.id
                : undefined,
            equipmentPublicCategoryName: undefined,
            equipmentLocationName: undefined,
            equipmentTagNames: undefined,
        }));

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

    const addEquipmentTag = async (equipmentTag: PartialDeep<IEquipmentTagObjectionModel>) => {
        // The product adding is done in two steps. First, use a POST request to add the equipment.
        const addRequest = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipmentTag: equipmentTag }),
        };

        return fetch('/api/equipmentTags', addRequest)
            .then((apiResponse) => getResponseContentOrError<IEquipmentTagObjectionModel>(apiResponse))
            .then((data) => {
                showCreateSuccessNotification(data.name);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification(equipmentTag.name ?? 'Taggen');
            });
    };

    const addEquipmentLocation = async (equipmentLocation: PartialDeep<IEquipmentLocationObjectionModel>) => {
        // The product adding is done in two steps. First, use a POST request to add the equipment.
        const addRequest = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipmentLocation: equipmentLocation }),
        };

        return fetch('/api/equipmentLocations', addRequest)
            .then((apiResponse) => getResponseContentOrError<IEquipmentLocationObjectionModel>(apiResponse))
            .then((data) => {
                showCreateSuccessNotification(data.name);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification(equipmentLocation.name ?? 'Platsen');
            });
    };

    const addEquipmentPublicCategory = async (
        equipmentPublicCategory: PartialDeep<IEquipmentPublicCategoryObjectionModel>,
    ) => {
        // The product adding is done in two steps. First, use a POST request to add the equipment.
        const addRequest = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipmentPublicCategory: equipmentPublicCategory }),
        };

        return fetch('/api/equipmentPublicCategories', addRequest)
            .then((apiResponse) => getResponseContentOrError<IEquipmentPublicCategoryObjectionModel>(apiResponse))
            .then((data) => {
                showCreateSuccessNotification(data.name);
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification(equipmentPublicCategory.name ?? 'Publika Kategorin');
            });
    };

    return (
        <Layout title={pageTitle} currentUser={currentUser}>
            <Header title={pageTitle} breadcrumbs={breadcrumbs}>
                <Button
                    variant="primary"
                    disabled={!modelsAreValid || equipmentToImport.length == 0 || importHasStarted}
                    onClick={() => importAll()}
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

                    {errorMessage ? (
                        <p className="text-danger">
                            <FontAwesomeIcon icon={faExclamationCircle} /> {errorMessage}
                        </p>
                    ) : null}

                    {!jsonError && !importHasStarted ? (
                        <>
                            <p>
                                Utrustning att importera: {equipmentToImport?.length} st (
                                {(equipmentInJson?.length ?? 0) - equipmentToImport?.length} st finns redan och har
                                ignorerats)
                            </p>
                            <p>
                                Taggar att importera: {equipmentTagsToImport?.length} st (
                                {(uniqueEquipmentTagNames?.length ?? 0) - equipmentTagsToImport?.length} st finns redan
                                och har ignorerats)
                            </p>
                            <p>
                                Platser att importera: {equipmentLocationsToImport?.length} st (
                                {(uniqueEquipmentLocationNames?.length ?? 0) - equipmentLocationsToImport?.length} st
                                finns redan och har ignorerats)
                            </p>
                            <p>
                                Publika kategorier att importera: {equipmentPublicCategoriesToImport?.length} st (
                                {(uniqueEquipmentPublicCategoryNames?.length ?? 0) -
                                    equipmentPublicCategoriesToImport?.length}{' '}
                                st finns redan och har ignorerats)
                            </p>
                            <p>
                                Valideringsstatus:{' '}
                                {modelsAreValid ? <span>Ok</span> : <span className="text-danger">Felaktig</span>}
                            </p>
                        </>
                    ) : null}

                    {!jsonError && importHasStarted ? (
                        <>
                            <p>
                                Taggar: {numberOfImportedEquipmentTags} / {equipmentTagsToImport?.length}
                            </p>
                            <ProgressBar
                                className="mb-3"
                                now={
                                    (equipmentTagsToImport.length === 0
                                        ? 100
                                        : numberOfImportedEquipmentTags / equipmentTagsToImport.length) * 100
                                }
                            />

                            <p>
                                Platser: {numberOfImportedEquipmentLocations} / {equipmentLocationsToImport?.length}
                            </p>
                            <ProgressBar
                                className="mb-3"
                                now={
                                    (equipmentLocationsToImport.length === 0
                                        ? 100
                                        : numberOfImportedEquipmentLocations / equipmentLocationsToImport.length) * 100
                                }
                            />

                            <p>
                                Publika Kategorier: {numberOfImportedEquipmentPublicCategories} /{' '}
                                {equipmentPublicCategoriesToImport?.length}
                            </p>
                            <ProgressBar
                                className="mb-3"
                                now={
                                    (equipmentPublicCategoriesToImport.length === 0
                                        ? 100
                                        : numberOfImportedEquipmentPublicCategories /
                                          equipmentPublicCategoriesToImport.length) * 100
                                }
                            />

                            <p>
                                Utrustning: {numberOfImportedEquipments} / {equipmentToImport?.length}
                            </p>
                            <ProgressBar
                                className="mb-3"
                                now={(numberOfImportedEquipments / equipmentToImport.length) * 100}
                            />
                        </>
                    ) : null}

                    {done ? (
                        <p className="text-success">
                            <FontAwesomeIcon icon={faCheckCircle} /> Import klar!
                        </p>
                    ) : null}
                </Card.Body>
            </Card>

            <Form.Group controlId="formDescriptionEN">
                <Form.Label>JSON</Form.Label>
                <Form.Control
                    as="textarea"
                    placeholder="[{...}]"
                    rows={10}
                    name="json"
                    onChange={(e) => setJson(e.target.value)}
                    defaultValue={json}
                    disabled={importHasStarted}
                />
            </Form.Group>
        </Layout>
    );
};

export default EquipmentJsonImportPage;
