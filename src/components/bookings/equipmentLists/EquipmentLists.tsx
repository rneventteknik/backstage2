import React, { useState } from 'react';
import { Badge, Button, Card, Col, Dropdown, DropdownButton, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { Equipment, EquipmentPrice } from '../../../models/interfaces';
import useSwr from 'swr';
import { bookingFetcher } from '../../../lib/fetchers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faAngleUp,
    faEraser,
    faExclamationCircle,
    faExternalLink,
    faGears,
    faLink,
    faPlus,
    faTrashCan,
    faBackward,
    faClone,
    faBarsStaggered,
    faCalendarDays,
    faRightFromBracket,
    faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { TableConfiguration, TableDisplay } from '../../TableDisplay';
import {
    getResponseContentOrError,
    updateItemsInArrayById,
    toIntOrUndefined,
    getRentalStatusName,
} from '../../../lib/utils';
import {
    EquipmentListObjectionModel,
    IBookingObjectionModel,
    IEquipmentListObjectionModel,
} from '../../../models/objection-models/BookingObjectionModel';
import { toBooking, toEquipmentList, toEquipmentListObjectionModel } from '../../../lib/mappers/booking';
import { useNotifications } from '../../../lib/useNotifications';
import EquipmentSearch, { ResultType, SearchResultViewModel } from '../../EquipmentSearch';
import { IEquipmentObjectionModel, IEquipmentPackageObjectionModel } from '../../../models/objection-models';
import { toEquipment } from '../../../lib/mappers/equipment';
import Skeleton from 'react-loading-skeleton';
import { DoubleClickToEdit, DoubleClickToEditDropdown, DoubleClickToEditDatetime } from '../../utils/DoubleClickToEdit';
import {
    formatNumberAsCurrency,
    formatPrice,
    formatTHSPrice,
    getEquipmentListPrice,
    getPrice,
} from '../../../lib/pricingUtils';
import { toEquipmentPackage } from '../../../lib/mappers/equipmentPackage';
import { PricePlan } from '../../../models/enums/PricePlan';
import {
    getNextSortIndex,
    getSortedList,
    isFirst,
    isLast,
    moveItemDown,
    moveItemUp,
    sortIndexSortFn,
} from '../../../lib/sortIndexUtils';
import { RentalStatus } from '../../../models/enums/RentalStatus';
import { BookingType } from '../../../models/enums/BookingType';
import CopyEquipmentListEntriesModal from './CopyEquipmentListEntriesModal';
import EquipmentListEntryConflictStatus from './EquipmentListEntryConflictStatus';
import { Status } from '../../../models/enums/Status';
import BookingReturnalNoteModal from '../BookingReturnalNoteModal';
import { FormNumberFieldWithoutScroll } from '../../utils/FormNumberFieldWithoutScroll';
import { Language } from '../../../models/enums/Language';
import {
    formatDatetime,
    getEquipmentInDatetime,
    getEquipmentOutDatetime,
    getNumberOfDays,
    getNumberOfEquipmentOutDays,
} from '../../../lib/datetimeUtils';
import ConfirmModal from '../../utils/ConfirmModal';

type Props = {
    bookingId: number;
    readonly: boolean;
};

type EquipmentListDisplayProps = {
    bookingId: number;
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
const EquipmentLists: React.FC<Props> = ({ bookingId, readonly }: Props) => {
    const { data: booking, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));

    const {
        showCreateSuccessNotification,
        showCreateFailedNotification,
        showSaveSuccessNotification,
        showSaveFailedNotification,
        showDeleteSuccessNotification,
        showDeleteFailedNotification,
    } = useNotifications();

    // Extract the lists
    //
    const equipmentLists = booking?.equipmentLists;

    const mutateLists = (updatedLists: EquipmentList[]) => {
        if (!booking) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, equipmentLists: updatedLists }, false);
    };

    // Error handling
    //
    if (error || (booking && !equipmentLists)) {
        return (
            <Card className="mb-3">
                <Card.Header>
                    <div className="d-flex">
                        <div className="flex-grow-1 mr-4" style={{ fontSize: '1.6em' }}>
                            Utrustning
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <p className="text-danger">
                        <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda utrustningslistorna.
                    </p>
                    <p className="text-monospace text-muted mb-0">{error?.message}</p>
                </Card.Body>
            </Card>
        );
    }

    // Loading skeleton
    //
    if (!booking || !equipmentLists) {
        return <Skeleton height={200} className="mb-3" />;
    }

    const createNewList = async () => {
        const listToCopyDatesFrom = equipmentLists.find((list) => isLast(equipmentLists, list));

        const newEquipmentList: Partial<EquipmentListObjectionModel> = {
            name: 'Utrustning',
            sortIndex: equipmentLists ? getNextSortIndex(equipmentLists) : 10,
            equipmentInDatetime: listToCopyDatesFrom?.equipmentInDatetime?.toISOString(),
            equipmentOutDatetime: listToCopyDatesFrom?.equipmentOutDatetime?.toISOString(),
            usageStartDatetime: listToCopyDatesFrom?.usageStartDatetime?.toISOString(),
            usageEndDatetime: listToCopyDatesFrom?.usageEndDatetime?.toISOString(),
            numberOfDays: listToCopyDatesFrom?.numberOfDays,
        };
        const body = { equipmentList: newEquipmentList };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + booking.id + '/equipmentLists', request)
            .then((apiResponse) => getResponseContentOrError<IEquipmentListObjectionModel>(apiResponse))
            .then(toEquipmentList)
            .then((data) => {
                mutateLists([...(equipmentLists ?? []), data]);
                showCreateSuccessNotification('Listan');
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Listan');
            });
    };

    const deleteList = (list: EquipmentList) => {
        mutateLists(equipmentLists?.filter((x) => x.id != list.id));

        const request = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/bookings/' + booking.id + '/equipmentLists/' + list.id, request)
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

        mutateLists(getSortedList(updateItemsInArrayById(equipmentLists, ...modifiedLists)));

        const requestsPromise = Promise.all(
            modifiedLists.map((updatedList) => {
                // Only update sortIndex
                const body = { equipmentList: { id: updatedList.id, sortIndex: updatedList.sortIndex } };

                const request = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                };

                return fetch('/api/bookings/' + booking.id + '/equipmentLists/' + updatedList.id, request).then(
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
                    bookingId={bookingId}
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
    bookingId,
    deleteListFn: parentDeleteListFn,
    moveListFn: parentMoveListFn,
    isFirstFn: parentIsFirstFn,
    isLastFn: parentIsLastFn,
    readonly,
}: EquipmentListDisplayProps) => {
    const { data: booking, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));

    const { showSaveSuccessNotification, showSaveFailedNotification, showErrorMessage } = useNotifications();
    const [showImportModal, setShowImportModal] = useState(false);
    const [showEmptyListModal, setShowEmptyListModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showListContent, setShowListContent] = useState(true);
    const [showReturnalNoteModal, setShowReturnalNoteModal] = useState(false);
    const [showResetDatesModal, setShowResetDatesModal] = useState(false);
    const [equipmentListEntryToEditViewModel, setEquipmentListEntryToEditViewModel] =
        useState<Partial<EquipmentListEntry> | null>(null);

    // Extract this list
    //
    const list = booking?.equipmentLists?.find((list) => list.id === partialList.id);

    const mutateList = (updatedList: EquipmentList) => {
        if (!booking || !booking.equipmentLists) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, equipmentLists: updateItemsInArrayById(booking.equipmentLists, updatedList) }, false);
    };

    // Error handling
    //
    if (error || (booking && !list)) {
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
                    <p className="text-monospace text-muted mb-0">{error?.message}</p>
                </Card.Body>
            </Card>
        );
    }

    // Loading skeleton
    //
    if (!booking || !list) {
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

    // Getter to get the default list entry for a given equipment (i.e. initial number of hours, units, price etc)
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
            name: booking.language === Language.SV ? equipment.name : equipment.nameEN,
            description: booking.language === Language.SV ? equipment.description : equipment.descriptionEN,
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

    const importEquipmentEntries = (
        equipmentListEntries: Omit<EquipmentListEntry, 'id' | 'created' | 'updated' | 'sortIndex'>[],
    ) => {
        let nextId = getNextEquipmentListEntryId();
        let nextSortIndex = getNextSortIndex(list.equipmentListEntries);

        const equipmentListEntriesToImport: EquipmentListEntry[] = equipmentListEntries.map((x) => {
            const entity = {
                id: nextId,
                sortIndex: nextSortIndex,

                equipmentId: x.equipmentId,
                equipment: x.equipment,
                equipmentPrice: x.equipmentPrice,
                numberOfUnits: x.numberOfUnits,
                numberOfHours: x.numberOfHours,
                discount: x.discount,

                name: x.name,
                description: x.description,

                pricePerUnit: x.pricePerUnit,
                pricePerHour: x.pricePerHour,
            };

            nextId += 1;
            nextSortIndex += 10;

            return entity;
        });

        saveList({ ...list, equipmentListEntries: [...list.equipmentListEntries, ...equipmentListEntriesToImport] });
    };

    // Function to save list. Note: this function instantly calls the API to save on the server.
    // We may want to add some debouncing or a delay to reduce the number rof requests to the server.
    //
    const saveList = (updatedList: EquipmentList) => {
        mutateList(updatedList);

        const body = { equipmentList: toEquipmentListObjectionModel(updatedList, booking.id) };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + booking.id + '/equipmentLists/' + partialList.id, request)
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

    // Note: This function modifies the booking, not the list
    const saveReturnalNote = (returnalNote: string) => {
        const body = { booking: { id: booking.id, returnalNote } };

        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/bookings/' + booking.id, request)
            .then((apiResponse) => getResponseContentOrError<IBookingObjectionModel>(apiResponse))
            .then(toBooking)
            .then(() => {
                mutate({ ...booking, returnalNote: returnalNote });
                showSaveSuccessNotification('Återlämningsanmärkningen');
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Återlämningsanmärkningen');
            });
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
            <div className="mb-0">
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
                {entry.equipment?.isArchived ? (
                    <Badge variant="warning" className="ml-1">
                        Arkiverad
                    </Badge>
                ) : null}
                {entry.equipment && getEquipmentOutDatetime(list) && getEquipmentInDatetime(list) ? (
                    <span className="ml-1">
                        <EquipmentListEntryConflictStatus
                            equipment={entry.equipment}
                            equipmentList={list}
                            startDatetime={getEquipmentOutDatetime(list) ?? new Date()}
                            endDatetime={getEquipmentInDatetime(list) ?? new Date()}
                        />
                    </span>
                ) : null}
            </div>
            <div className="mb-0">
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
            </div>

            <div className="mb-0 text-muted d-md-none">{EquipmentListEntryNumberOfHoursDisplayFn(entry)}</div>
            <div className="mb-0 text-muted d-md-none">{EquipmentListEntryPriceDisplayFn(entry)}</div>
            <div className="mb-0 text-muted d-md-none">{EquipmentListEntryTotalPriceDisplayFn(entry)}</div>
        </>
    );

    const EquipmentListEntryNumberOfUnitsDisplayFn = (entry: EquipmentListEntry) => {
        const valueIsRelevant = entry.pricePerUnit !== 0;

        if (!valueIsRelevant && entry.numberOfUnits === 1) {
            return <span className="text-muted">{entry.numberOfUnits} st</span>;
        }

        return (
            <DoubleClickToEdit
                value={entry.numberOfUnits?.toString()}
                onUpdate={(newValue) =>
                    updateListEntry({ ...entry, numberOfUnits: toIntOrUndefined(newValue, true) ?? 0 })
                }
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
                onUpdate={(newValue) =>
                    updateListEntry({ ...entry, numberOfHours: toIntOrUndefined(newValue, true) ?? 0 })
                }
                size="sm"
                readonly={readonly}
            >
                <span className={valueIsRelevant ? '' : 'text-muted'}>{entry.numberOfHours} h</span>
            </DoubleClickToEdit>
        );
    };

    const EquipmentListEntryPriceDisplayFn = (entry: EquipmentListEntry) => {
        const customPriceDropdownValue: EquipmentPrice = {
            id: -1,
            name: 'Anpassat pris',
            pricePerUnit: entry.pricePerUnit,
            pricePerHour: entry.pricePerHour,
            pricePerUnitTHS: entry.pricePerUnit,
            pricePerHourTHS: entry.pricePerHour,
        };
        return entry.equipment && entry.equipment.prices.length ? (
            <>
                <DoubleClickToEditDropdown<EquipmentPrice>
                    options={
                        entry.equipmentPrice
                            ? entry.equipment.prices
                            : [customPriceDropdownValue, ...entry.equipment.prices]
                    }
                    value={entry.equipmentPrice ?? customPriceDropdownValue}
                    optionLabelFn={(x) => `${x.name} ${priceDisplayFn(x)}`}
                    optionKeyFn={(x) => x.id.toString()}
                    onChange={(newPrice) =>
                        newPrice && newPrice.id != -1
                            ? updateListEntry({ ...entry, ...getEquipmentListEntryPrices(newPrice) })
                            : null
                    }
                    onClose={(newPrice) =>
                        newPrice && newPrice.id != -1
                            ? updateListEntry({ ...entry, ...getEquipmentListEntryPrices(newPrice) })
                            : null
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
                            <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => moveListEntryDown(entry)}
                            disabled={isLast(list.equipmentListEntries, entry)}
                        >
                            <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                        </Dropdown.Item>
                    </>
                )}
                <Dropdown.Item href={'/equipment/' + entry.equipmentId} target="_blank" disabled={!entry.equipment}>
                    <FontAwesomeIcon icon={faExternalLink} className="mr-1 fa-fw" /> Öppna utrustning i ny flik
                </Dropdown.Item>
                {readonly ? null : (
                    <>
                        <Dropdown.Item onClick={() => setEquipmentListEntryToEditViewModel(entry)}>
                            <FontAwesomeIcon icon={faGears} className="mr-1 fa-fw" /> Avancerad redigering
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
                            <FontAwesomeIcon icon={faEraser} className="mr-1 fa-fw" /> Återställ rad
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deleteListEntry(entry)} className="text-danger">
                            <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort rad
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

    // Consts to control which date edit components are shown (i.e. interval, dates or both). Note that
    // the logic for usage dates and in/out dates are seperated.
    const showIntervalControls = list.numberOfDays !== null && list.numberOfDays !== undefined;
    const showDateControls =
        list.numberOfDays === null ||
        list.numberOfDays === undefined ||
        list.usageStartDatetime ||
        list.usageEndDatetime ||
        list.equipmentOutDatetime ||
        list.equipmentInDatetime;

    // Verify that start dates are before end dates, and if ok, then save the list. Otherwise show an eror and return.
    const verifyTimesAndSaveList = (updatedList: EquipmentList) => {
        if (
            updatedList.usageStartDatetime &&
            updatedList.usageEndDatetime &&
            updatedList.usageStartDatetime.getTime() >= updatedList.usageEndDatetime.getTime()
        ) {
            showErrorMessage('Starttid måste vara innan sluttid');
            return;
        }

        const equipmentInDatetime = getEquipmentInDatetime(updatedList);
        const equipmentOutDatetime = getEquipmentOutDatetime(updatedList);

        if (
            equipmentOutDatetime &&
            equipmentInDatetime &&
            equipmentOutDatetime.getTime() >= equipmentInDatetime.getTime()
        ) {
            showErrorMessage('Utlämning måste vara innan återlämning');
            return;
        }
        saveList(updatedList);
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
                                {booking.bookingType === BookingType.RENTAL && list.rentalStatus == undefined ? (
                                    <Button
                                        variant="secondary"
                                        onClick={() => saveList({ ...list, rentalStatus: RentalStatus.OUT })}
                                        className="mr-2"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" /> Lämna ut
                                    </Button>
                                ) : null}

                                {booking.bookingType === BookingType.RENTAL && list.rentalStatus == RentalStatus.OUT ? (
                                    <>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowReturnalNoteModal(true)}
                                            className="mr-2"
                                        >
                                            <FontAwesomeIcon icon={faRightToBracket} className="mr-1" /> Ta emot
                                        </Button>
                                        <BookingReturnalNoteModal
                                            booking={booking}
                                            onSubmit={(returnalNote) => {
                                                saveReturnalNote(returnalNote);
                                                saveList({ ...list, rentalStatus: RentalStatus.RETURNED });
                                            }}
                                            hide={() => setShowReturnalNoteModal(false)}
                                            show={showReturnalNoteModal}
                                        />
                                    </>
                                ) : null}

                                <DropdownButton id="dropdown-basic-button" variant="secondary" title="Mer">
                                    <Dropdown.Item
                                        onClick={() => parentMoveListFn(list, 'UP')}
                                        disabled={parentIsFirstFn(list)}
                                    >
                                        <FontAwesomeIcon icon={faAngleUp} className="mr-1 fa-fw" /> Flytta upp
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => parentMoveListFn(list, 'DOWN')}
                                        disabled={parentIsLastFn(list)}
                                    >
                                        <FontAwesomeIcon icon={faAngleDown} className="mr-1 fa-fw" /> Flytta ner
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() =>
                                            setEquipmentListEntryToEditViewModel({
                                                numberOfUnits: 1,
                                                numberOfHours: 0,
                                            })
                                        }
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-1 fa-fw" />
                                        Lägg till egen rad
                                    </Dropdown.Item>
                                    {list.numberOfDays === null ? (
                                        booking.status === Status.DRAFT ? (
                                            <>
                                                <Dropdown.Item onClick={() => setShowResetDatesModal(true)}>
                                                    <FontAwesomeIcon icon={faBarsStaggered} className="mr-1 fa-fw" />
                                                    Ange endast antal dagar
                                                </Dropdown.Item>
                                                <ConfirmModal
                                                    show={showResetDatesModal}
                                                    onHide={() => setShowResetDatesModal(false)}
                                                    onConfirm={() => {
                                                        setShowResetDatesModal(false);
                                                        saveList({
                                                            ...list,
                                                            numberOfDays: getNumberOfDays(list) ?? 1,
                                                            usageStartDatetime: null,
                                                            usageEndDatetime: null,
                                                            equipmentInDatetime: null,
                                                            equipmentOutDatetime: null,
                                                        });
                                                    }}
                                                    title="Bekräfta"
                                                >
                                                    Vill du verkligen ta bort datumen från listan {list.name}?
                                                </ConfirmModal>
                                            </>
                                        ) : null
                                    ) : (
                                        <Dropdown.Item
                                            onClick={() =>
                                                saveList({
                                                    ...list,
                                                    numberOfDays: null,
                                                    usageStartDatetime: null,
                                                    usageEndDatetime: null,
                                                    equipmentInDatetime: null,
                                                    equipmentOutDatetime: null,
                                                })
                                            }
                                        >
                                            <FontAwesomeIcon icon={faCalendarDays} className="mr-1 fa-fw" />
                                            Sätt datum
                                        </Dropdown.Item>
                                    )}
                                    {booking.bookingType === BookingType.RENTAL ? (
                                        <Dropdown.Item
                                            onClick={() => saveList({ ...list, rentalStatus: null })}
                                            disabled={list.rentalStatus == undefined}
                                        >
                                            <FontAwesomeIcon icon={faBackward} className="mr-1 fa-fw" />
                                            Återställ utlämningsstatus
                                        </Dropdown.Item>
                                    ) : null}
                                    <Dropdown.Item onClick={() => setShowImportModal(true)}>
                                        <FontAwesomeIcon icon={faClone} className="mr-1 fa-fw" /> Hämta utrustning från
                                        bokning
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => setShowEmptyListModal(true)}>
                                        <FontAwesomeIcon icon={faEraser} className="mr-1 fa-fw" /> Töm utrustningslistan
                                    </Dropdown.Item>
                                    <ConfirmModal
                                        show={showEmptyListModal}
                                        onHide={() => setShowEmptyListModal(false)}
                                        confirmLabel="Töm listan"
                                        onConfirm={() => {
                                            setShowEmptyListModal(false);
                                            saveList({ ...list, equipmentListEntries: [] });
                                        }}
                                        title="Bekräfta"
                                    >
                                        Vill du verkligen tömma listan {list.name}?
                                    </ConfirmModal>
                                    <Dropdown.Item onClick={() => setShowDeleteModal(true)} className="text-danger">
                                        <FontAwesomeIcon icon={faTrashCan} className="mr-1 fa-fw" /> Ta bort
                                        utrustningslistan
                                    </Dropdown.Item>
                                    <ConfirmModal
                                        show={showDeleteModal}
                                        onHide={() => setShowDeleteModal(false)}
                                        confirmLabel="Ta bort"
                                        onConfirm={() => {
                                            setShowDeleteModal(false);
                                            deleteList();
                                        }}
                                        title="Bekräfta"
                                    >
                                        Vill du verkligen ta bort listan {list.name}?
                                    </ConfirmModal>
                                </DropdownButton>
                            </>
                        )}
                    </div>
                </div>
                <p className="text-muted">
                    {list.equipmentListEntries.length} rader / {formatNumberAsCurrency(getEquipmentListPrice(list))}
                    {getNumberOfDays(list) && getNumberOfEquipmentOutDays(list) ? (
                        <>
                            {' '}
                            / {getNumberOfEquipmentOutDays(list)} dagar / {getNumberOfDays(list)} debiterade dagar
                        </>
                    ) : null}
                    {booking.bookingType === BookingType.RENTAL ? (
                        <> / {getRentalStatusName(list.rentalStatus)}</>
                    ) : null}
                </p>
                {showIntervalControls ? (
                    <>
                        <small>Antal dagar</small>
                        <div className="d-flex">
                            <div className="flex-grow-1">
                                <div className="mb-3" style={{ fontSize: '1.2em' }}>
                                    <DoubleClickToEdit
                                        value={list.numberOfDays?.toString()}
                                        inputType="number"
                                        onUpdate={(newValue) =>
                                            saveList({
                                                ...list,
                                                numberOfDays: toIntOrUndefined(newValue) ?? 1,
                                            })
                                        }
                                        readonly={readonly}
                                        className="mb-3 d-block"
                                    >
                                        {list.numberOfDays} {list.numberOfDays != 1 ? 'dagar' : 'dag'}
                                    </DoubleClickToEdit>
                                </div>
                            </div>
                            <div>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        saveList({
                                            ...list,
                                            numberOfDays: null,
                                            usageStartDatetime: null,
                                            usageEndDatetime: null,
                                            equipmentInDatetime: null,
                                            equipmentOutDatetime: null,
                                        })
                                    }
                                    className="mr-2"
                                >
                                    <FontAwesomeIcon icon={faCalendarDays} className="mr-1 fa-fw" />
                                    Sätt datum
                                </Button>
                            </div>
                        </div>
                    </>
                ) : null}
                {showDateControls ? (
                    <Row>
                        <Col md={3} xs={6}>
                            <small>Debiterad starttid</small>
                            <div style={{ fontSize: '1.2em' }}>
                                <DoubleClickToEditDatetime
                                    value={list.usageStartDatetime}
                                    onUpdate={(newValue) =>
                                        verifyTimesAndSaveList({ ...list, usageStartDatetime: newValue ?? null })
                                    }
                                    max={list.usageEndDatetime
                                        ?.toISOString()
                                        .substring(0, list.usageEndDatetime?.toISOString().indexOf('T') + 6)}
                                    readonly={readonly}
                                    className="d-block"
                                />
                            </div>
                        </Col>
                        <Col md={3} xs={6}>
                            <small>Debiterad sluttid</small>
                            <div style={{ fontSize: '1.2em' }}>
                                <DoubleClickToEditDatetime
                                    value={list.usageEndDatetime}
                                    onUpdate={(newValue) =>
                                        verifyTimesAndSaveList({ ...list, usageEndDatetime: newValue ?? null })
                                    }
                                    min={list.usageStartDatetime
                                        ?.toISOString()
                                        .substring(0, list.usageStartDatetime?.toISOString().indexOf('T') + 6)}
                                    readonly={readonly}
                                    className="d-block"
                                />
                            </div>
                        </Col>
                        <Col md={3} xs={6}>
                            <small>Utlämning</small>
                            <div style={{ fontSize: '1.2em' }}>
                                <DoubleClickToEditDatetime
                                    value={list.equipmentOutDatetime}
                                    onUpdate={(newValue) =>
                                        verifyTimesAndSaveList({ ...list, equipmentOutDatetime: newValue ?? null })
                                    }
                                    max={getEquipmentInDatetime(list)
                                        ?.toISOString()
                                        .substring(
                                            0,
                                            (getEquipmentInDatetime(list)?.toISOString()?.indexOf('T') ?? 0) + 6,
                                        )}
                                    readonly={readonly}
                                    placeholder={formatDatetime(list.usageStartDatetime, 'N/A')}
                                />
                            </div>
                        </Col>
                        <Col md={3} xs={6}>
                            <small>Återlämning</small>
                            <div style={{ fontSize: '1.2em' }}>
                                <DoubleClickToEditDatetime
                                    value={list.equipmentInDatetime}
                                    onUpdate={(newValue) =>
                                        verifyTimesAndSaveList({ ...list, equipmentInDatetime: newValue ?? null })
                                    }
                                    min={getEquipmentOutDatetime(list)
                                        ?.toISOString()
                                        .substring(
                                            0,
                                            (getEquipmentOutDatetime(list)?.toISOString()?.indexOf('T') ?? 0) + 6,
                                        )}
                                    readonly={readonly}
                                    placeholder={formatDatetime(list.usageEndDatetime, 'N/A')}
                                />
                            </div>
                        </Col>
                    </Row>
                ) : null}
            </Card.Header>

            {showListContent ? (
                <>
                    <TableDisplay entities={list.equipmentListEntries} configuration={tableSettings} />

                    {readonly ? null : (
                        <div className="ml-2 mr-2 mb-2">
                            <EquipmentSearch
                                placeholder="Lägg till utrustning"
                                includePackages={true}
                                language={booking.language}
                                id="equipment-search"
                                onSelect={(x) => addFromSearch(x)}
                            />
                        </div>
                    )}
                </>
            ) : null}

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
                                        <FormNumberFieldWithoutScroll
                                            type="number"
                                            min="0"
                                            value={equipmentListEntryToEditViewModel?.numberOfUnits ?? ''}
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
                                        <FormNumberFieldWithoutScroll
                                            type="number"
                                            min="0"
                                            value={equipmentListEntryToEditViewModel.numberOfHours ?? ''}
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
                                        <option value={undefined}>Anpassat pris</option>
                                        {equipmentListEntryToEditViewModel.equipment?.prices?.map((x) => (
                                            <option key={x.id.toString()} value={x.id.toString()}>
                                                {x.name} {priceDisplayFn(x)}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col lg={4} xs={6}>
                                <Form.Group>
                                    <Form.Label>Pris per styck</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={!equipmentListEntryToEditViewModel.equipmentPrice ? 'number' : 'text'}
                                            min="0"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice}
                                            value={equipmentListEntryToEditViewModel?.pricePerUnit ?? ''}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerUnit: toIntOrUndefined(e.target.value, true),
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
                                            type={!equipmentListEntryToEditViewModel.equipmentPrice ? 'number' : 'text'}
                                            min="0"
                                            disabled={!!equipmentListEntryToEditViewModel.equipmentPrice}
                                            value={equipmentListEntryToEditViewModel?.pricePerHour ?? ''}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    pricePerHour: toIntOrUndefined(e.target.value, true),
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
                                        <FormNumberFieldWithoutScroll
                                            type="number"
                                            min="0"
                                            value={equipmentListEntryToEditViewModel?.discount ?? ''}
                                            onChange={(e) =>
                                                setEquipmentListEntryToEditViewModel({
                                                    ...equipmentListEntryToEditViewModel,
                                                    discount: toIntOrUndefined(e.target.value, true),
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
                                    <FontAwesomeIcon icon={faLink} className="mr-1" size="sm" />
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
                                description: equipmentListEntryToEditViewModel.description ?? '',
                                numberOfUnits: Math.abs(equipmentListEntryToEditViewModel.numberOfUnits ?? 1),
                                numberOfHours: Math.abs(equipmentListEntryToEditViewModel.numberOfHours ?? 0),
                                pricePerUnit: Math.abs(equipmentListEntryToEditViewModel.pricePerUnit ?? 0),
                                pricePerHour: Math.abs(equipmentListEntryToEditViewModel.pricePerHour ?? 0),
                                equipmentPrice: equipmentListEntryToEditViewModel.equipmentPrice,
                                discount: Math.abs(equipmentListEntryToEditViewModel.discount ?? 0),
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

            <CopyEquipmentListEntriesModal
                show={showImportModal}
                onHide={() => setShowImportModal(false)}
                onImport={importEquipmentEntries}
                pricePlan={booking.pricePlan}
                language={booking.language}
            />
        </Card>
    );
};

export default EquipmentLists;
