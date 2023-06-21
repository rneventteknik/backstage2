import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import useSwr from 'swr';
import { bookingFetcher } from '../../../lib/fetchers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../../../models/interfaces/EquipmentList';
import { getResponseContentOrError, updateItemsInArrayById } from '../../../lib/utils';
import {
    EquipmentListEntryObjectionModel,
    EquipmentListHeadingObjectionModel,
    IBookingObjectionModel,
} from '../../../models/objection-models/BookingObjectionModel';
import {
    toBooking,
    toEquipmentList,
    toEquipmentListEntry,
    toEquipmentListHeadingEntry,
} from '../../../lib/mappers/booking';
import { useNotifications } from '../../../lib/useNotifications';
import Skeleton from 'react-loading-skeleton';
import { formatPrice, formatTHSPrice } from '../../../lib/pricingUtils';
import { PricePlan } from '../../../models/enums/PricePlan';
import { getNextSortIndex } from '../../../lib/sortIndexUtils';
import EditEquipmentListEntryModal from './EditEquipmentListEntryModal';
import {
    addTimeEstimateApiCall,
    addListEntryApiCall,
    addListHeadingApiCall,
    deleteListEntryApiCall,
    deleteListHeadingApiCall,
    getEntitiesToDisplay,
    getEquipmentListEntryPrices,
    getNextEquipmentListEntryId,
    saveListApiCall,
    saveListEntryApiCall,
    saveListHeadingApiCall,
} from '../../../lib/equipmentListUtils';
import { EquipmentPrice, TimeEstimate } from '../../../models/interfaces';
import EquipmentListTable from './EquipmentListTable';
import EquipmentListHeader from './EquipmentListHeader';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import { useLocalStorageState } from '../../../lib/useLocalStorageState';
import { ITimeEstimateObjectionModel } from '../../../models/objection-models';

type Props = {
    bookingId: number;
    list: Partial<EquipmentList>;
    readonly: boolean;
    defaultLaborHourlyRate: number;
    deleteListFn: (x: EquipmentList) => void;
    moveListFn: (x: EquipmentList, direction: 'UP' | 'DOWN') => void;
    isFirstFn: (x: EquipmentList) => boolean;
    isLastFn: (x: EquipmentList) => boolean;
    globalSettings: KeyValue[];
};

const EquipmentListDisplay: React.FC<Props> = ({
    list: partialList,
    bookingId,
    defaultLaborHourlyRate,
    deleteListFn: parentDeleteListFn,
    moveListFn: parentMoveListFn,
    isFirstFn: parentIsFirstFn,
    isLastFn: parentIsLastFn,
    readonly,
    globalSettings,
}: Props) => {
    const { data: booking, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));

    const {
        showSaveSuccessNotification,
        showSaveFailedNotification,
        showCreateSuccessNotification,
        showCreateFailedNotification,
    } = useNotifications();

    const [showListContent, setShowListContent] = useLocalStorageState(
        'equipment-list-' + partialList.id + '-show-list-content',
        true,
    );
    const [equipmentListEntryToEditViewModel, setEquipmentListEntryToEditViewModel] =
        useState<Partial<EquipmentListEntry> | null>(null);

    // Extract this list
    //
    const list = booking?.equipmentLists?.find((list) => list.id === partialList.id);

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

    // Save functions
    //

    // Update the local model. This function does not update the server.
    const mutateList = (updatedList: EquipmentList) => {
        if (!booking || !booking.equipmentLists) {
            throw new Error('Invalid booking');
        }
        mutate({ ...booking, equipmentLists: updateItemsInArrayById(booking.equipmentLists, updatedList) }, false);
    };

    // Note: this function instantly calls the API to save on the server.
    // We may want to add some debouncing or a delay to reduce the number of requests to the server.
    const saveList = (updatedList: EquipmentList) => {
        mutateList(updatedList);

        saveListApiCall(updatedList, booking.id)
            .then(toEquipmentList)
            .then(() => {
                showSaveSuccessNotification('Listan');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
            });
    };

    // Note: this function instantly calls the API to save on the server.
    // We may want to add some debouncing or a delay to reduce the number of requests to the server.
    const saveListEntry = (
        entry: EquipmentListEntry,
        objectionModelOverrides: Partial<EquipmentListEntryObjectionModel> = {},
    ) => {
        // Before updating serverside, do a local update. Note: This local update will not perform moving into our out from headings, that is only done server side.
        const listToUpdate = booking.equipmentLists?.find(
            (list) =>
                list.listEntries.some((e) => e.id === entry.id) ||
                list.listHeadings.some((heading) => heading.listEntries.some((e) => e.id === entry.id)),
        );

        if (!listToUpdate) {
            throw new Error('Invalid list entry. No corresponding list found.');
        }

        mutateList({
            ...listToUpdate,
            listEntries: updateItemsInArrayById(listToUpdate.listEntries, entry),
            listHeadings: listToUpdate.listHeadings.map((h) => ({
                ...h,
                listEntries: updateItemsInArrayById(h.listEntries, entry),
            })),
        });

        saveListEntryApiCall(entry, booking.id, objectionModelOverrides)
            .then(toEquipmentListEntry)
            .then(() => {
                showSaveSuccessNotification('Listposten');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listposten');
                mutate();
            });
    };

    const saveListHeading = (
        heading: EquipmentListHeading,
        objectionModelOverrides: Partial<EquipmentListHeadingObjectionModel> = {},
    ) => {
        // Before updating serverside, do a local update.
        const listToUpdate = booking.equipmentLists?.find((list) => list.listHeadings.some((h) => h.id === heading.id));

        if (!listToUpdate) {
            throw new Error('Invalid list entry. No corresponding list found.');
        }

        mutateList({
            ...listToUpdate,
            listHeadings: updateItemsInArrayById(listToUpdate.listHeadings, heading),
        });

        saveListHeadingApiCall(heading, booking.id, objectionModelOverrides)
            .then(toEquipmentListHeadingEntry)
            .then(() => {
                showSaveSuccessNotification('Listposten');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listposten');
                mutate();
            });
    };

    const saveListEntriesAndHeadings = async (
        entries: Partial<EquipmentListEntry>[],
        headings: Partial<EquipmentListHeading>[],
    ) => {
        // Local update of shallow properties to make the UI more snappy
        mutate(
            {
                ...booking,
                equipmentLists: booking.equipmentLists?.map((list) => ({
                    ...list,
                    listEntries: list.listEntries.map((entry) => ({
                        ...entry,
                        ...(entries.find((x) => x.id === entry.id) ?? {}),
                    })),
                    listHeadings: list.listHeadings.map((heading) => ({
                        ...heading,
                        ...(headings.find((x) => x.id === heading.id) ?? {}),
                        listEntries: heading.listEntries.map((entry) => ({
                            ...entry,
                            ...(entries.find((x) => x.id === entry.id) ?? {}),
                        })),
                    })),
                })),
            },
            false,
        );

        Promise.all([
            ...entries.map(async (entry) => saveListEntryApiCall(entry, booking.id)),
            ...headings.map(async (heading) => saveListHeadingApiCall(heading, booking.id)),
        ])
            .then(() => {
                showSaveSuccessNotification('Listan');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
                mutate();
            });
    };

    const deleteList = () => {
        parentDeleteListFn(list);
    };

    const deleteListEntry = (entry: EquipmentListEntry) => {
        deleteListEntryApiCall(entry, booking.id)
            .then(() => {
                showSaveSuccessNotification('Listposten');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listposten');
                mutate();
            });
    };

    const deleteListHeading = (heading: EquipmentListHeading) => {
        deleteListHeadingApiCall(heading, booking.id)
            .then(() => {
                showSaveSuccessNotification('Listposten');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listposten');
                mutate();
            });
    };

    const addListEntries = async (
        entries: EquipmentListEntry[],
        listId: number | undefined,
        headerId?: number | undefined,
    ) => {
        Promise.all(entries.map(async (entry) => addListEntryApiCall(entry, booking.id, listId, headerId)))
            .then(() => {
                showSaveSuccessNotification('Listan');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
                mutate();
            });
    };

    const addListHeading = async (heading: EquipmentListHeading, listId: number) => {
        addListHeadingApiCall(heading, booking.id, listId)
            .then(() => {
                showSaveSuccessNotification('Listan');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
                mutate();
            });
    };

    const addListEntriesAndHeadings = async (
        entries: EquipmentListEntry[],
        headings: EquipmentListHeading[],
        listId: number,
    ) => {
        Promise.all([
            ...entries.map(async (entry) => addListEntryApiCall(entry, booking.id, listId)),
            ...headings.map(async (heading) => addListHeadingApiCall(heading, booking.id, listId)),
        ])

            .then(() => {
                showSaveSuccessNotification('Listan');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showSaveFailedNotification('Listan');
                mutate();
            });
    };

    const addTimeEstimate = async (timeEstimate: Partial<TimeEstimate>) => {
        const timeEstimateToSend: ITimeEstimateObjectionModel = {
            bookingId: booking.id,
            numberOfHours: timeEstimate.numberOfHours ?? 0,
            pricePerHour: timeEstimate.pricePerHour ?? defaultLaborHourlyRate,
            name: timeEstimate.name ?? '',
            sortIndex: getNextSortIndex(booking.timeEstimates ?? []),
        };

        addTimeEstimateApiCall(timeEstimateToSend, booking.id)
            .then(() => {
                showCreateSuccessNotification('Tidsestimatet');
                mutate();
            })
            .catch((error: Error) => {
                console.error(error);
                showCreateFailedNotification('Tidsestimatet');
                mutate();
            });
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

    // On edit-modal save
    const onEditModalSave = (entryToSave: EquipmentListEntry, isNew: boolean) => {
        if (!isNew) {
            saveListEntry(entryToSave);
        } else {
            saveList({
                ...list,
                listEntries: [...list.listEntries, entryToSave],
            });
        }

        setEquipmentListEntryToEditViewModel(null);
    };

    // HTML template
    //
    return (
        <Card className="mb-3">
            <Card.Header>
                <EquipmentListHeader
                    list={list}
                    bookingId={bookingId}
                    pricePlan={booking.pricePlan}
                    language={booking.language}
                    bookingStatus={booking.status}
                    bookingType={booking.bookingType}
                    returnalNote={booking.returnalNote}
                    showListContent={showListContent}
                    saveList={saveList}
                    addListHeading={addListHeading}
                    addListEntriesAndHeadings={addListEntriesAndHeadings}
                    deleteList={deleteList}
                    editEntry={setEquipmentListEntryToEditViewModel}
                    saveReturnalNote={saveReturnalNote}
                    toggleListContent={() => setShowListContent((x) => !x)}
                    moveListUp={() => parentMoveListFn(list, 'UP')}
                    moveListDown={() => parentMoveListFn(list, 'DOWN')}
                    disableMoveUp={parentIsFirstFn(list)}
                    disableMoveDown={parentIsLastFn(list)}
                    readonly={readonly}
                />
            </Card.Header>

            {showListContent ? (
                <EquipmentListTable
                    list={list}
                    otherLists={booking.equipmentLists?.filter((x) => x.id !== list.id) ?? []}
                    pricePlan={booking.pricePlan}
                    language={booking.language}
                    defaultLaborHourlyRate={defaultLaborHourlyRate}
                    showPricesAsMuted={booking.fixedPrice !== null}
                    saveListEntry={saveListEntry}
                    saveListHeading={saveListHeading}
                    saveListEntriesAndHeadings={saveListEntriesAndHeadings}
                    deleteListEntry={deleteListEntry}
                    deleteListHeading={deleteListHeading}
                    addListEntries={addListEntries}
                    addListHeading={addListHeading}
                    addTimeEstimate={addTimeEstimate}
                    editEntry={setEquipmentListEntryToEditViewModel}
                    readonly={readonly}
                />
            ) : null}

            <EditEquipmentListEntryModal
                show={equipmentListEntryToEditViewModel != null}
                onHide={() => setEquipmentListEntryToEditViewModel(null)}
                priceDisplayFn={booking.pricePlan === PricePlan.EXTERNAL ? formatPrice : formatTHSPrice}
                getEquipmentListEntryPrices={(x: EquipmentPrice) => getEquipmentListEntryPrices(x, booking.pricePlan)}
                equipmentListEntryToEditViewModel={equipmentListEntryToEditViewModel}
                setEquipmentListEntryToEditViewModel={setEquipmentListEntryToEditViewModel}
                onSave={onEditModalSave}
                nextId={getNextEquipmentListEntryId(list)}
                nextSortIndex={getNextSortIndex(getEntitiesToDisplay(list))}
                globalSettings={globalSettings}
            />
        </Card>
    );
};

export default EquipmentListDisplay;
