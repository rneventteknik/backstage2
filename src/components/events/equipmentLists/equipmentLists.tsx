import React, { useState } from 'react';
import { Button, Card, Col, Dropdown, DropdownButton, Modal, Row } from 'react-bootstrap';
import { Equipment, EquipmentPrice, Event } from '../../../models/interfaces';
import useSwr from 'swr';
import { equipmentListFetcher, equipmentListsFetcher } from '../../../lib/fetchers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faExclamationCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { TableConfiguration, TableDisplay } from '../../TableDisplay';
import { getResponseContentOrError } from '../../../lib/utils';
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
import { formatNumberAsCurrency, formatPrice, formatTHSPrice, getPrice } from '../../../lib/pricingUtils';
import { toEquipmentPackage } from '../../../lib/mappers/equipmentPackage';
import { PricePlan } from '../../../models/enums/PricePlan';
import { HasId } from '../../../models/interfaces/BaseEntity';

type Props = {
    event: Partial<Event> & HasId;
};

type EquipmentListDisplayProps = {
    event: Partial<Event> & HasId;
    list: Partial<EquipmentList>;
    deleteListFn: (x: EquipmentList) => void;
};

// This component only contains logic to create and delete lists. Everything else
// is handled by the EquipmentListDisplay component which manages it's list internally.
//
const EquipmentLists: React.FC<Props> = ({ event: booking }: Props) => {
    const { data: equipmentLists, mutate } = useSwr(
        '/api/events/' + booking.id + '/equipmentLists',
        equipmentListsFetcher,
    );
    const {
        showCreateSuccessNotification,
        showCreateFailedNotification,
        showDeleteSuccessNotification,
        showDeleteFailedNotification,
    } = useNotifications();

    const createNewList = async () => {
        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name: 'Utrustning',
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

    return (
        <>
            {equipmentLists?.map((x) => (
                <EquipmentListDisplay list={x} key={x.id} event={booking} deleteListFn={deleteList} />
            ))}
            <p className="text-center">
                <Button className="mt-4" variant="secondary" size="sm" onClick={() => createNewList()}>
                    <FontAwesomeIcon icon={faPlus} className="mr-1" /> Lägg till utrustningslista
                </Button>
            </p>
        </>
    );
};

const EquipmentListDisplay: React.FC<EquipmentListDisplayProps> = ({
    list: partialList,
    event: booking,
    deleteListFn: parentDeleteListFn,
}: EquipmentListDisplayProps) => {
    const { data: list, mutate, error } = useSwr(
        '/api/events/' + booking.id + '/equipmentLists/' + partialList.id,
        equipmentListFetcher,
    );
    const { showSaveSuccessNotification, showSaveFailedNotification, showErrorMessage } = useNotifications();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showListContent, setShowListContent] = useState(true);

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
    const getDefaultListEntryFromEquipment = (equipment: Equipment, id = 0, override?: Partial<EquipmentListEntry>) => {
        if (!equipment.id) {
            throw new Error('Invalid equipment');
        }

        const prices = getEquipmentListEntryPrices(equipment.prices[0]);

        const entry: EquipmentListEntry = {
            id: id,
            equipment: equipment,
            equipmentId: equipment.id,
            numberOfUnits: prices.pricePerUnit > 0 ? 1 : 0,
            numberOfHours: prices.pricePerHour > 0 ? 1 : 0,
            name: equipment.name,
            nameEN: equipment.nameEN,
            description: equipment.description,
            descriptionEN: equipment.descriptionEN,
            ...prices,
        };

        return { ...entry, ...(override ?? {}) };
    };

    // Helper functions to add equipment
    //

    const addEquipment = (equipment: Equipment, numberOfUnits?: number) => {
        addMultipleEquipment([{ equipment, numberOfUnits }]);
    };

    const addMultipleEquipment = (entries: { equipment: Equipment; numberOfUnits?: number }[]) => {
        let nextId = Math.max(1, ...(list?.equipmentListEntries ?? []).map((x) => x.id)) + 1;
        const entriesToAdd = entries.map((x) => {
            // This id is only used in the client, it is striped before sending to the server
            return getDefaultListEntryFromEquipment(
                x.equipment,
                nextId++,
                x.numberOfUnits ? { numberOfUnits: x.numberOfUnits } : {},
            );
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
        const newEquipmentListEntries = list.equipmentListEntries.map((x) => (x.id === listEntry.id ? listEntry : x));
        saveList({ ...list, equipmentListEntries: newEquipmentListEntries });
    };

    const deleteListEntry = (listEntry: EquipmentListEntry) => {
        const newEquipmentListEntries = list.equipmentListEntries.filter((x) => x.id != listEntry.id);
        saveList({ ...list, equipmentListEntries: newEquipmentListEntries });
    };

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
                >
                    {entry.name}
                </DoubleClickToEdit>
            </p>
            <p className="mb-0">
                <DoubleClickToEdit
                    value={entry.description}
                    onUpdate={(newValue) => updateListEntry({ ...entry, description: newValue })}
                    size="sm"
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

        if (!valueIsRelevant && entry.numberOfUnits === 0) {
            return <></>;
        }

        return (
            <DoubleClickToEdit
                value={entry.numberOfUnits?.toString()}
                onUpdate={(newValue) =>
                    updateListEntry({ ...entry, numberOfUnits: isNaN(parseInt(newValue)) ? 0 : parseInt(newValue) })
                }
                size="sm"
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
                onUpdate={(newValue) =>
                    updateListEntry({ ...entry, numberOfHours: isNaN(parseInt(newValue)) ? 0 : parseInt(newValue) })
                }
                size="sm"
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfHours} h</span>
            </DoubleClickToEdit>
        );
    };

    const EquipmentListEntryPriceDisplayFn = (entry: EquipmentListEntry) => {
        const priceDisplayFn = booking.pricePlan === PricePlan.EXTERNAL ? formatPrice : formatTHSPrice;
        return (
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
                >
                    {formatPrice({ pricePerHour: entry.pricePerHour, pricePerUnit: entry.pricePerUnit })}
                    {entry.equipment.prices.length > 1 ? (
                        <p className="text-muted mb-0">{entry.equipmentPrice.name}</p>
                    ) : null}
                </DoubleClickToEditDropdown>
            </>
        );
    };

    const EquipmentListEntryTotalPriceDisplayFn = (entry: EquipmentListEntry) => {
        return <em>{formatNumberAsCurrency(getPrice(entry))}</em>;
    };

    const EquipmentListEntryActionsDisplayFn = (entry: EquipmentListEntry) => {
        return (
            <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer" size="sm">
                <Dropdown.Item href={'/equipment/' + entry.equipmentId} target="_blank">
                    Öppna utrustning i ny flik
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={() => updateListEntry(getDefaultListEntryFromEquipment(entry.equipment, entry.id))}
                >
                    Återställ rad
                </Dropdown.Item>
                <Dropdown.Item onClick={() => deleteListEntry(entry)} className="text-danger">
                    Ta bort rad
                </Dropdown.Item>
            </DropdownButton>
        );
    };

    // Table settings
    //
    const tableSettings: TableConfiguration<EquipmentListEntry> = {
        entityTypeDisplayName: '',
        defaultSortPropertyName: 'name',
        defaultSortAscending: true,
        hideTableFilter: true,
        hideTableCountControls: true,
        noResultsLabel: 'Listan är tom',
        columns: [
            {
                key: 'name',
                displayName: 'Utrustning',
                getValue: (entry: EquipmentListEntry) => entry.equipment.name + ' ' + entry.equipment.description,
                getContentOverride: EquipmentListEntryNameDisplayFn,
            },
            {
                key: 'count',
                displayName: 'Antal',
                getValue: (entry: EquipmentListEntry) => entry.numberOfUnits,
                getContentOverride: EquipmentListEntryNumberOfUnitsDisplayFn,
                textAlignment: 'center',
                columnWidth: 80,
            },
            {
                key: 'hours',
                displayName: 'Timmar',
                getValue: (entry: EquipmentListEntry) => entry.numberOfHours,
                getContentOverride: EquipmentListEntryNumberOfHoursDisplayFn,
                textAlignment: 'center',
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
                textAlignment: 'center',
                cellHideSize: 'md',
            },
            {
                key: 'sum',
                displayName: 'Summa',
                getValue: (entry: EquipmentListEntry) => getPrice(entry),
                getContentOverride: EquipmentListEntryTotalPriceDisplayFn,
                columnWidth: 90,
                textAlignment: 'center',
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
                        >
                            {list.name}
                        </DoubleClickToEdit>
                    </div>
                    <div className="d-flex">
                        <Button className="mr-2" variant="" onClick={() => setShowListContent(!showListContent)}>
                            <FontAwesomeIcon icon={showListContent ? faAngleUp : faAngleDown} />
                        </Button>
                        <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                            <Dropdown.Item onClick={() => saveList({ ...list, equipmentListEntries: [] })}>
                                Töm utrustningslistan
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                                Ta bort utrustningslistan
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </div>
                <p className="text-muted">
                    {list.equipmentListEntries.length} rader /{' '}
                    {formatNumberAsCurrency(list.equipmentListEntries.reduce((sum, entry) => sum + getPrice(entry), 0))}
                    {list.equipmentInDatetime &&
                    list.equipmentOutDatetime &&
                    list.usageStartDatetime &&
                    list.usageEndDatetime ? (
                        <>
                            {' '}
                            /{' '}
                            {(list.equipmentInDatetime.getTime() - list.equipmentOutDatetime.getTime()) /
                                (1000 * 3600 * 24)}{' '}
                            dagar /{' '}
                            {(list.usageEndDatetime.getTime() - list.usageStartDatetime.getTime()) / (1000 * 3600 * 24)}{' '}
                            debiterade dagar
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
                                />
                            </Col>
                            <Col>
                                <DoubleClickToEditDate
                                    value={list.usageEndDatetime}
                                    onUpdate={(newValue) => saveList({ ...list, usageEndDatetime: newValue })}
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
                                />
                            </Col>
                            <Col>
                                <DoubleClickToEditDate
                                    value={list.equipmentInDatetime}
                                    onUpdate={(newValue) => saveList({ ...list, equipmentInDatetime: newValue })}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card.Header>

            {showListContent ? (
                <>
                    <TableDisplay entities={list.equipmentListEntries} configuration={tableSettings} />

                    <div className="ml-2 mr-2 mb-2">
                        <EquipmentSearch
                            placeholder="Lägg till utrustning"
                            includePackages={true}
                            id="equipment-search"
                            onSelect={(x) => addFromSearch(x)}
                        />
                    </div>
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
        </Card>
    );
};

export default EquipmentLists;
