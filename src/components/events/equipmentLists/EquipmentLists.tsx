import React, { useState } from 'react';
import { Button, Card, Col, Dropdown, DropdownButton, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { Equipment, EquipmentPrice, Event } from '../../../models/interfaces';
import useSwr from 'swr';
import { equipmentListFetcher, equipmentListsFetcher } from '../../../lib/fetchers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faExclamationCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { TableConfiguration, TableDisplay } from '../../TableDisplay';
import { getResponseContentOrError, updateItemsInArrayById, toIntOrUndefined } from '../../../lib/utils';
import {
    EquipmentListObjectionModel,
    IEquipmentListObjectionModel,
} from '../../../models/objection-models/EventObjectionModel';
import { toEquipmentList, toEquipmentListObjectionModel } from '../../../lib/mappers/event';
import { useNotifications } from '../../../lib/useNotifications';
import EquipmentSearch, { ResultType, SearchResultViewModel } from '../../EquipmentSearch';
import { IEquipmentObjectionModel, IEquipmentPackageObjectionModel } from '../../../models/objection-models';
import { toEquipment } from '../../../lib/mappers/equipment';
import Skeleton from 'react-loading-skeleton';
import { DoubleClickToEditDate, DoubleClickToEdit, DoubleClickToEditDropdown } from '../../utils/DoubleClickToEdit';
import {
    formatNumberAsCurrency,
    formatPrice,
    formatTHSPrice,
    getEquipmentListPrice,
    getNumberOfDays,
    getNumberOfEquipmentOutDays,
    getPrice,
} from '../../../lib/pricingUtils';
import { toEquipmentPackage } from '../../../lib/mappers/equipmentPackage';
import { PricePlan } from '../../../models/enums/PricePlan';
import { HasId } from '../../../models/interfaces/BaseEntity';
import {
    getNextSortIndex,
    getSortedList,
    isFirst,
    isLast,
    moveItemDown,
    moveItemUp,
    sortIndexSortFn,
} from '../../../lib/sortIndexUtils';

type Props = {
    event: Partial<Event> & HasId;
    readonly: boolean;
};

type EquipmentListDisplayProps = {
    event: Partial<Event> & HasId;
    list: Partial<EquipmentList>;
    readonly: boolean;
    deleteListFn: (x: EquipmentList) => void;
    moveListFn: (x: EquipmentList, direction: 'UP' | 'DOWN') => void;
    isFirstFn: (x: EquipmentList) => boolean;
    isLastFn: (x: EquipmentList) => boolean;
};

// This component only contains logic to create and delete lists. Everything else
// is handled by the EquipmentListDisplay component which manages it's list internally.
//
const EquipmentLists: React.FC<Props> = ({ event: booking, readonly }: Props) => {
    const { data: equipmentLists, mutate } = useSwr('/api/events/' + booking.id + '/equipmentLists', (url) =>
        equipmentListsFetcher(url).then((list) => getSortedList(list)),
    );
    const {
        showCreateSuccessNotification,
        showCreateFailedNotification,
        showSaveSuccessNotification,
        showSaveFailedNotification,
        showDeleteSuccessNotification,
        showDeleteFailedNotification,
    } = useNotifications();

    const createNewList = async () => {
        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name: 'Utrustning',
            sortIndex: equipmentLists ? getNextSortIndex(equipmentLists) : 10,
        };
        const body = { equipmentList: newEquipmentList };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/events/' + booking.id + '/equipmentLists', request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse))
            .then(toEquipmentList)
            .then((data) => {
                mutate([...(equipmentLists ?? []), data]);
                showCreateSuccessNotification('Listan');
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Listan');
            });
    };

    const deleteList = (list: EquipmentList) => {
        mutate(
            equipmentLists?.filter((x) => x.id != list.id),
            false,
        );

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/events/' + booking.id + '/equipmentLists/' + list.id, request)
            .then(getResponseContentOrError)
            .then(() => {
                showDeleteSuccessNotification('Listan');
            })
            .catch((error) => {
                console.error(error);
                showDeleteFailedNotification('Listan');
            });
    };

    const moveList = (list: EquipmentList, direction: 'UP' | 'DOWN') => {
        if (!equipmentLists) {
            throw new Error('Invalid list');
        }

        const modifiedLists =
            direction === 'UP' ? moveItemUp(equipmentLists, list) : moveItemDown(equipmentLists, list);

        mutate(getSortedList(updateItemsInArrayById(equipmentLists, ...modifiedLists)), false);

        const requestsPromise = Promise.all(
            modifiedLists.map((updatedList) => {
                // Only update sortIndex
                const body = { equipmentList: { id: updatedList.id, sortIndex: updatedList.sortIndex } };

                const request = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                };

                return fetch('/api/events/' + booking.id + '/equipmentLists/' + updatedList.id, request).then(
                    getResponseContentOrError,
                );
            }),
        );

        requestsPromise
            .then(() => {
                showSaveSuccessNotification('Bokningen');
            })
            .catch((error) => {
                console.error(error);
                showSaveFailedNotification('Bokningen');
            });
    };

    return (
        <>
            {equipmentLists?.map((x) => (
                <EquipmentListDisplay
                    list={x}
                    key={x.id}
                    event={booking}
                    readonly={readonly}
                    deleteListFn={deleteList}
                    moveListFn={moveList}
                    isFirstFn={(list: EquipmentList) => isFirst(equipmentLists, list)}
                    isLastFn={(list: EquipmentList) => isLast(equipmentLists, list)}
                />
            ))}
            {readonly ? null : (
                <p className="text-center">
                    <Button className="mt-4" variant="secondary" size="sm" onClick={() => createNewList()}>
                        <FontAwesomeIcon icon={faPlus} className="mr-1" /> Lägg till utrustningslista
                    </Button>
                </p>
            )}
        </>
    );
};

const EquipmentListDisplay: React.FC<EquipmentListDisplayProps> = ({
    list: partialList,
    event: booking,
    deleteListFn: parentDeleteListFn,
    moveListFn: parentMoveListFn,
    isFirstFn: parentIsFirstFn,
    isLastFn: parentIsLastFn,
    readonly,
}: EquipmentListDisplayProps) => {
    const {
        data: list,
        mutate,
        error,
    } = useSwr('/api/events/' + booking.id + '/equipmentLists/' + partialList.id, equipmentListFetcher);
    const { showSaveSuccessNotification, showSaveFailedNotification, showErrorMessage } = useNotifications();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showListContent, setShowListContent] = useState(true);
    const [equipmentListEntryToEditViewModel, setEquipmentListEntryToEditViewModel] =
        useState<Partial<EquipmentListEntry> | null>(null);

    // Error handling
    //
    if (error) {
        return (
            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex">
                        <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                            {partialList.name}
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <p className="text-danger">
                        <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda utrustningslistan.
                    </p>
                    <p className="text-monospace text-muted mb-0">{error.message}</p>
                </Card.Body>
            </Card>
        );
    }

    // Loading skeleton
    //
    if (!list) {
        return <Skeleton height={200} className="mb-3" />;
    }

    // Getter to get prices for equipment list entries
    //
    const getEquipmentListEntryPrices = (equipmentPrice: EquipmentPrice) => {
        return {
            pricePerHour:
                (booking.pricePlan === PricePlan.EXTERNAL
                    ? equipmentPrice?.pricePerHour
                    : equipmentPrice?.pricePerHourTHS) ?? 0,
            pricePerUnit:
                (booking.pricePlan === PricePlan.EXTERNAL
                    ? equipmentPrice?.pricePerUnit
                    : equipmentPrice?.pricePerUnitTHS) ?? 0,
            equipmentPrice: equipmentPrice,
        };
    };

    // Getter to get the default list entry for a given equipment (i.e. initial number of hurs, units, price etc)
    //
    const getDefaultListEntryFromEquipment = (
        equipment: Equipment,
        id: number,
        sortIndex: number,
        override?: Partial<EquipmentListEntry>,
    ) => {
        if (!equipment.id) {
            throw new Error('Invalid equipment');
        }

        const prices = getEquipmentListEntryPrices(equipment.prices[0]);

        const entry: EquipmentListEntry = {
            id: id,
            sortIndex: sortIndex,
            equipment: equipment,
            equipmentId: equipment.id,
            numberOfUnits: 1,
            numberOfHours: prices.pricePerHour > 0 ? 1 : 0,
            name: equipment.name,
            nameEN: equipment.nameEN,
            description: equipment.description,
            descriptionEN: equipment.descriptionEN,
            ...prices,
            discount: 0,
        };

        return { ...entry, ...(override ?? {}) };
    };

    // Helper functions to add equipment
    //

    const getNextEquipmentListEntryId = () => Math.min(-1, ...(list?.equipmentListEntries ?? []).map((x) => x.id)) - 1;

    const addEquipment = (equipment: Equipment, numberOfUnits?: number) => {
        addMultipleEquipment([{ equipment, numberOfUnits }]);
    };

    const addMultipleEquipment = (entries: { equipment: Equipment; numberOfUnits?: number }[]) => {
        let nextId = getNextEquipmentListEntryId();
        let nextSortIndex = getNextSortIndex(list.equipmentListEntries);

        const entriesToAdd = entries.map((x) => {
            // This id is only used in the client, it is striped before sending to the server
            const entity = getDefaultListEntryFromEquipment(
                x.equipment,
                nextId,
                nextSortIndex,
                x.numberOfUnits ? { numberOfUnits: x.numberOfUnits } : {},
            );

            nextId += 1;
            nextSortIndex += 10;

            return entity;
        });

        if (list) {
            saveList({ ...list, equipmentListEntries: [...list.equipmentListEntries, ...entriesToAdd] });
        }
    };

    const addFromSearch = (res: SearchResultViewModel) => {
        switch (res.type) {
            case ResultType.EQUIPMENT:
                fetch('/api/equipment/' + res.id)
                    .then((apiResponse) => getResponseContentOrError<IEquipmentObjectionModel>(apiResponse))
                    .then(toEquipment)
                    .then((equipment) => {
                        addEquipment(equipment);
                    })
                    .catch((error: Error) => {
                        console.error(error);
                        showErrorMessage('Kunde inte ladda hem utrustningen');
                    });
                break;

            case ResultType.EQUIPMENTPACKAGE:
                fetch('/api/equipmentPackage/' + res.id)
                    .then((apiResponse) => getResponseContentOrError<IEquipmentPackageObjectionModel>(apiResponse))
                    .then(toEquipmentPackage)
                    .then((equipmentPackage) => {
                        addMultipleEquipment(
                            equipmentPackage.equipmentEntries.filter((x) => x.equipment) as {
                                equipment: Equipment;
                                numberOfUnits?: number;
                            }[],
                        );
                    })
                    .catch((error: Error) => {
                        console.error(error);
                        showErrorMessage('Kunde inte ladda hem utrustningspaketet');
                    });
                break;
        }
    };

    // Function to save list. Note: this function instantly calls the API to save on the server.
    // We may want to add some deboucing or a delay to reduce the numbe rof requests to the server.
    //
    const saveList = (updatedList: EquipmentList) => {
        mutate(updatedList, false);

        const body = { equipmentList: toEquipmentListObjectionModel(updatedList, booking.id) };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/events/' + booking.id + '/equipmentLists/' + partialList.id, request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse))
            .then(toEquipmentList)
            .then(() => {
                showSaveSuccessNotification('Listan');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
            });
    };

    const deleteList = () => {
        setShowDeleteModal(false);
        parentDeleteListFn(list);
    };

    // List entry modification functions. Note: these will trigger a save of the whole list.
    //
    const updateListEntry = (listEntry: EquipmentListEntry) => {
        const newEquipmentListEntries = updateItemsInArrayById(list.equipmentListEntries, listEntry);
        saveList({ ...list, equipmentListEntries: newEquipmentListEntries });
    };

    const deleteListEntry = (listEntry: EquipmentListEntry) => {
        const newEquipmentListEntries = list.equipmentListEntries.filter((x) => x.id != listEntry.id);
        saveList({ ...list, equipmentListEntries: newEquipmentListEntries });
    };

    const moveListEntryUp = (listEntry: EquipmentListEntry) => {
        const newEquipmentListEntries = updateItemsInArrayById(
            list.equipmentListEntries,
            ...moveItemUp(list.equipmentListEntries, listEntry),
        );
        saveList({ ...list, equipmentListEntries: newEquipmentListEntries });
    };

    const moveListEntryDown = (listEntry: EquipmentListEntry) => {
        const newEquipmentListEntries = updateItemsInArrayById(
            list.equipmentListEntries,
            ...moveItemDown(list.equipmentListEntries, listEntry),
        );
        saveList({ ...list, equipmentListEntries: newEquipmentListEntries });
    };

    // Helper functions
    //
    const priceDisplayFn = booking.pricePlan === PricePlan.EXTERNAL ? formatPrice : formatTHSPrice;

    // Table display functions
    //

    const EquipmentListEntryNameDisplayFn = (entry: EquipmentListEntry) => (
        <>
            <p className="mb-0">
                <DoubleClickToEdit
                    value={entry.name}
                    onUpdate={(newValue) =>
                        updateListEntry({ ...entry, name: newValue && newValue.length > 0 ? newValue : entry.name })
                    }
                    size="sm"
                    readonly={readonly}
                >
                    {entry.name}
                </DoubleClickToEdit>
            </p>
            <p className="mb-0">
                <DoubleClickToEdit
                    value={entry.description}
                    onUpdate={(newValue) => updateListEntry({ ...entry, description: newValue })}
                    size="sm"
                    readonly={readonly}
                >
                    {entry.description && entry.description.length > 0 ? (
                        <span className="text-muted ">{entry.description}</span>
                    ) : (
                        <span className="text-muted font-italic">Dubbelklicka för att lägga till en beskrivning</span>
                    )}
                </DoubleClickToEdit>
            </p>

            <p className="mb-0 text-muted d-md-none">{EquipmentListEntryNumberOfHoursDisplayFn(entry)}</p>
            <p className="mb-0 text-muted d-md-none">{EquipmentListEntryPriceDisplayFn(entry)}</p>
            <p className="mb-0 text-muted d-md-none">{EquipmentListEntryTotalPriceDisplayFn(entry)}</p>
        </>
    );

    const EquipmentListEntryNumberOfUnitsDisplayFn = (entry: EquipmentListEntry) => {
        const valueIsRelevant = entry.pricePerUnit !== 0;

        if (!valueIsRelevant && entry.numberOfUnits === 1) {
            return <></>;
        }

        return (
            <DoubleClickToEdit
                value={entry.numberOfUnits?.toString()}
                onUpdate={(newValue) => updateListEntry({ ...entry, numberOfUnits: toIntOrUndefined(newValue) ?? 0 })}
                size="sm"
                readonly={readonly}
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfUnits} st</span>
            </DoubleClickToEdit>
        );
    };

    const EquipmentListEntryNumberOfHoursDisplayFn = (entry: EquipmentListEntry) => {
        const valueIsRelevant = entry.pricePerHour !== 0;

        if (!valueIsRelevant && entry.numberOfHours === 0) {
            return <></>;
        }

        return (
            <DoubleClickToEdit
                value={entry.numberOfHours.toString()}
                onUpdate={(newValue) => updateListEntry({ ...entry, numberOfHours: toIntOrUndefined(newValue) ?? 0 })}
                size="sm"
                readonly={readonly}
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfHours} h</span>
            </DoubleClickToEdit>
        );
    };

    const EquipmentListEntryPriceDisplayFn = (entry: EquipmentListEntry) => {
        return entry.equipment ? (
            <>
                <DoubleClickToEditDropdown<EquipmentPrice>
                    options={entry.equipment.prices}
                    value={entry.equipmentPrice ?? entry.equipment.prices[0]}
                    optionLabelFn={(x) => `${x.name} ${priceDisplayFn(x)}`}
                    optionKeyFn={(x) => x.id.toString()}
                    onChange={(newPrice) =>
                        newPrice ? updateListEntry({ ...entry, ...getEquipmentListEntryPrices(newPrice) }) : null
                    }
                    onClose={(newPrice) =>
                        newPrice ? updateListEntry({ ...entry, ...getEquipmentListEntryPrices(newPrice) }) : null
                    }
                    readonly={readonly}
                >
                    {formatPrice({ pricePerHour: entry.pricePerHour, pricePerUnit: entry.pricePerUnit })}
                    {entry.equipmentPrice && entry.equipment.prices.length > 1 ? (
                        <p className="text-muted mb-0">{entry.equipmentPrice.name}</p>
                    ) : null}
                </DoubleClickToEditDropdown>
            </>
        ) : (
            formatPrice({ pricePerHour: entry.pricePerHour, pricePerUnit: entry.pricePerUnit })
        );
    };

    const EquipmentListEntryTotalPriceDisplayFn = (entry: EquipmentListEntry) => {
        return (
            <em
                title={
                    entry.discount > 0
                        ? `${formatNumberAsCurrency(
                              getPrice(entry, getNumberOfDays(list), false),
                          )}\n-${formatNumberAsCurrency(entry.discount)} (rabatt)\n`
                        : ''
                }
                className={entry.discount > 0 ? 'text-danger' : ''}
            >
                {formatNumberAsCurrency(getPrice(entry, getNumberOfDays(list)))}
            </em>
        );
    };

    const EquipmentListEntryActionsDisplayFn = (entry: EquipmentListEntry) => {
        return (
            <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                {readonly ? null : (
                    <>
                        <Dropdown.Item
                            onClick={() => moveListEntryUp(entry)}
                            disabled={isFirst(list.equipmentListEntries, entry)}
                        >
                            Flytta upp
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => moveListEntryDown(entry)}
                            disabled={isLast(list.equipmentListEntries, entry)}
                        >
                            Flytta ner
                        </Dropdown.Item>
                    </>
                )}
                <Dropdown.Item href={'/equipment/' + entry.equipmentId} target="_blank" disabled={!entry.equipment}>
                    Öppna utrustning i ny flik
                </Dropdown.Item>
                {readonly ? null : (
                    <>
                        <Dropdown.Item onClick={() => setEquipmentListEntryToEditViewModel(entry)}>
                            Avancerad redigering
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            onClick={() =>
                                entry.equipment
                                    ? updateListEntry(
                                          getDefaultListEntryFromEquipment(entry.equipment, entry.id, entry.sortIndex),
                                      )
                                    : null
                            }
                        >
                            Återställ rad
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deleteListEntry(entry)} className="text-danger">
                            Ta bort rad
                        </Dropdown.Item>
                    </>
                )}
            </DropdownButton>
        );
    };

    const sortFn = (a: EquipmentListEntry, b: EquipmentListEntry) => sortIndexSortFn(a, b);

    // Table settings
    //
    const tableSettings: TableConfiguration<EquipmentListEntry> = {
        entityTypeDisplayName: '',
        customSortFn: sortFn,
        hideTableFilter: true,
        hideTableCountControls: true,
        noResultsLabel: 'Listan är tom',
        columns: [
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (entry: EquipmentListEntry) => entry.name + ' ' + entry.description,
                getContentOverride: EquipmentListEntryNameDisplayFn,
            },
            {
                key: 'count',
                displayName: 'Antal',
                getValue: (entry: EquipmentListEntry) => entry.numberOfUnits,
                getContentOverride: EquipmentListEntryNumberOfUnitsDisplayFn,
                textAlignment: 'right',
                columnWidth: 80,
            },
            {
                key: 'hours',
                displayName: 'Timmar',
                getValue: (entry: EquipmentListEntry) => entry.numberOfHours,
                getContentOverride: EquipmentListEntryNumberOfHoursDisplayFn,
                textAlignment: 'right',
                cellHideSize: 'md',
                columnWidth: 100,
            },
            {
                key: 'price',
                displayName: 'Pris',
                getValue: () => '',
                disableSort: true,
                getContentOverride: EquipmentListEntryPriceDisplayFn,
                columnWidth: 140,
                textAlignment: 'right',
                cellHideSize: 'md',
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (entry: EquipmentListEntry) => getPrice(entry, getNumberOfDays(list)),
                getContentOverride: EquipmentListEntryTotalPriceDisplayFn,
                columnWidth: 90,
                textAlignment: 'right',
                cellHideSize: 'md',
            },
            {
                key: 'actions',
                displayName: '',
                getValue: () => '',
                disableSort: true,
                getContentOverride: EquipmentListEntryActionsDisplayFn,
                columnWidth: 75,
                textAlignment: 'center',
            },
        ],
    };

    return (
        <Card className="mb-3">
            <Card.Header>
                <div className="d-flex">
                    <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                        <DoubleClickToEdit
                            value={list.name}
                            onUpdate={(newValue: string) =>
                                saveList({ ...list, name: newValue && newValue.length > 0 ? newValue : list.name })
                            }
                            readonly={readonly}
                        >
                            {list.name}
                        </DoubleClickToEdit>
                    </div>
                    <div className="d-flex">
                        <Button className="mr-2" variant="" onClick={() => setShowListContent(!showListContent)}>
                            <FontAwesomeIcon icon={showListContent ? faAngleUp : faAngleDown} />
                        </Button>
                        {readonly ? null : (
                            <>
                                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                                    <Dropdown.Item
                                        onClick={() => parentMoveListFn(list, 'UP')}
                                        disabled={parentIsFirstFn(list)}
                                    >
                                        Flytta upp
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => parentMoveListFn(list, 'DOWN')}
                                        disabled={parentIsLastFn(list)}
                                    >
                                        Flytta ner
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() =>
                                            setEquipmentListEntryToEditViewModel({
                                                numberOfUnits: 1,
                                                numberOfHours: 0,
                                            })
                                        }
                                    >
                                        Lägg till egen rad
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => saveList({ ...list, equipmentListEntries: [] })}>
                                        Töm utrustningslistan
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                                        Ta bort utrustningslistan
                                    </Dropdown.Item>
                                </DropdownButton>
                            </>
                        )}
                    </div>
                </div>
                <p className="text-muted">
                    {list.equipmentListEntries.length} rader / {formatNumberAsCurrency(getEquipmentListPrice(list))}
                    {list.equipmentInDatetime &&
                    list.equipmentOutDatetime &&
                    list.usageStartDatetime &&
                    list.usageEndDatetime ? (
                        <>
                            {' '}
                            / {getNumberOfEquipmentOutDays(list)} dagar / {getNumberOfDays(list)} debiterade dagar
                        </>
                    ) : null}
                </p>
                <Row>
                    <Col md={6}>
                        <div>
                            <small>Debiterade dagar</small>
                        </div>
                        <Row style={{ fontSize: '1.2em' }}>
                            <Col>
                                <DoubleClickToEditDate
                                    value={list.usageStartDatetime}
                                    onUpdate={(newValue) => saveList({ ...list, usageStartDatetime: newValue })}
                                    readonly={readonly}
                                />
                            </Col>
                            <Col>
                                <DoubleClickToEditDate
                                    value={list.usageEndDatetime}
                                    onUpdate={(newValue) => saveList({ ...list, usageEndDatetime: newValue })}
                                    readonly={readonly}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col md={6}>
                        <small>Utlämnade dagar</small>
                        <Row style={{ fontSize: '1.2em' }}>
                            <Col>
                                <DoubleClickToEditDate
                                    value={list.equipmentOutDatetime}
                                    onUpdate={(newValue) => saveList({ ...list, equipmentOutDatetime: newValue })}
                                    readonly={readonly}
                                />
                            </Col>
                            <Col>
                                <DoubleClickToEditDate
                                    value={list.equipmentInDatetime}
                                    onUpdate={(newValue) => saveList({ ...list, equipmentInDatetime: newValue })}
                                    readonly={readonly}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card.Header>

            {showListContent ? (
                <>
                    <TableDisplay entities={list.equipmentListEntries} configuration={tableSettings} />

                    {readonly ? null : (
                        <div className="ml-2 mr-2 mb-2">
                            <EquipmentSearch
                                placeholder="Lägg till utrustning"
                                includePackages={true}
                                id="equipment-search"
                                onSelect={(x) => addFromSearch(x)}
                            />
                        </div>
                    )}
                </>
            ) : null}

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bekräfta</Modal.Title>
                </Modal.Header>
                <Modal.Body> Vill du verkligen ta bort listan {list.name}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
                        Avbryt
                    </Button>
                    <Button variant="danger" onClick={() => deleteList()}>
                        Ta bort
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={!!equipmentListEntryToEditViewModel}
                onHide={() => setEquipmentListEntryToEditViewModel(null)}
                size="lg"
            >
                {!!equipmentListEntryToEditViewModel ? (
                    <Modal.Body>
                        <Row>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Namn</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={equipmentListEntryToEditViewModel?.name}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Antal</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={equipmentListEntryToEditViewModel?.numberOfUnits}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    numberOfUnits: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>st</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Timmar</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={equipmentListEntryToEditViewModel.numberOfHours}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    numberOfHours: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>h</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>Pris</Form.Label>

                                    <Form.Control
                                        as="select"
                                        disabled={!equipmentListEntryToEditViewModel.equipment}
                                        defaultValue={equipmentListEntryToEditViewModel.equipmentPrice?.id}
                                        onChange={(e) => {
                                            const newEquipmentPrice =
                                                equipmentListEntryToEditViewModel.equipment?.prices.filter(
                                                    (x) => x.id == toIntOrUndefined(e.target.value),
                                                )[0];
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                ...(newEquipmentPrice
                                                    ? getEquipmentListEntryPrices(newEquipmentPrice)
                                                    : { equipmentPrice: undefined }),
                                            });
                                        }}
                                    >
                                        {equipmentListEntryToEditViewModel.equipment?.prices?.map((x) => (
                                            <option key={x.id.toString()} value={x.id.toString()}>
                                                {x.name} {priceDisplayFn(x)}
                                            </option>
                                        ))}
                                        <option value={undefined}>Eget pris</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Pris per styck</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice}
                                            value={equipmentListEntryToEditViewModel?.pricePerUnit}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerUnit: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>kr/st</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Pris per timme</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice}
                                            value={equipmentListEntryToEditViewModel?.pricePerHour}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerHour: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>kr/h</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Rabatt</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={equipmentListEntryToEditViewModel?.discount}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    discount: toIntOrUndefined(e.target.value),
                                                })
                                            }
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text>kr</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId="formPrices">
                                    <Form.Label>Beskrivning</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        value={equipmentListEntryToEditViewModel?.description}
                                        onChange={(e) =>
                                            setEquipmentListEntryToEditViewModel({
                                                ...equipmentListEntryToEditViewModel,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {!!equipmentListEntryToEditViewModel.equipment ? (
                            <p className="text-muted">
                                <span>
                                    Den här raden är länkad till utrustningen{' '}
                                    <em>{equipmentListEntryToEditViewModel.equipment.name}</em>.{' '}
                                </span>
                                <a
                                    href="#"
                                    className="text-danger"
                                    onClick={() =>
                                        setEquipmentListEntryToEditViewModel({
                                            ...equipmentListEntryToEditViewModel,
                                            equipment: undefined,
                                            equipmentId: undefined,
                                            equipmentPrice: undefined,
                                        })
                                    }
                                >
                                    Ta bort koppling
                                </a>
                            </p>
                        ) : null}
                    </Modal.Body>
                ) : null}
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEquipmentListEntryToEditViewModel(null)}>
                        Avbryt
                    </Button>
                    <Button
                        variant="primary"
                        disabled={!equipmentListEntryToEditViewModel?.name}
                        onClick={() => {
                            if (!equipmentListEntryToEditViewModel) {
                                throw new Error('Invalid equipmentListEntryToEditViewModel');
                            }

                            // Since we are editing a partial model we need to set default values to any properties without value before saving
                            const entryToSave: EquipmentListEntry = {
                                id: equipmentListEntryToEditViewModel.id ?? getNextEquipmentListEntryId(),
                                sortIndex:
                                    equipmentListEntryToEditViewModel.sortIndex ??
                                    getNextSortIndex(list.equipmentListEntries),
                                equipment: equipmentListEntryToEditViewModel.equipment,
                                equipmentId: equipmentListEntryToEditViewModel.equipmentId,
                                name: equipmentListEntryToEditViewModel.name ?? '',
                                nameEN: equipmentListEntryToEditViewModel.nameEN ?? '',
                                description: equipmentListEntryToEditViewModel.description ?? '',
                                descriptionEN: equipmentListEntryToEditViewModel.descriptionEN ?? '',
                                numberOfUnits: equipmentListEntryToEditViewModel.numberOfUnits ?? 1,
                                numberOfHours: equipmentListEntryToEditViewModel.numberOfHours ?? 0,
                                pricePerUnit: equipmentListEntryToEditViewModel.pricePerUnit ?? 0,
                                pricePerHour: equipmentListEntryToEditViewModel.pricePerHour ?? 0,
                                equipmentPrice: equipmentListEntryToEditViewModel.equipmentPrice,
                                discount: equipmentListEntryToEditViewModel.discount ?? 0,
                            };

                            if (equipmentListEntryToEditViewModel.id) {
                                updateListEntry(entryToSave);
                            } else {
                                saveList({
                                    ...list,
                                    equipmentListEntries: [...list.equipmentListEntries, entryToSave],
                                });
                            }

                            setEquipmentListEntryToEditViewModel(null);
                        }}
                    >
                        Spara
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default EquipmentLists;
