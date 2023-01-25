import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import useSwr from 'swr';
import { bookingFetcher } from '../../../lib/fetchers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { EquipmentList, EquipmentListEntry } from '../../../models/interfaces/EquipmentList';
import { getResponseContentOrError, updateItemsInArrayById } from '../../../lib/utils';
import {
    IBookingObjectionModel,
    IEquipmentListObjectionModel,
} from '../../../models/objection-models/BookingObjectionModel';
import { toBooking, toEquipmentList, toEquipmentListObjectionModel } from '../../../lib/mappers/booking';
import { useNotifications } from '../../../lib/useNotifications';
import Skeleton from 'react-loading-skeleton';
import { formatPrice, formatTHSPrice } from '../../../lib/pricingUtils';
import { PricePlan } from '../../../models/enums/PricePlan';
import { getNextSortIndex } from '../../../lib/sortIndexUtils';
import EditEquipmentListEntryModal from './EditEquipmentListEntryModal';
import {
    getEntitiesToDisplay,
    getEquipmentListEntryPrices,
    getNextEquipmentListEntryId,
    updateListEntry,
} from '../../../lib/equipmentListUtils';
import { EquipmentPrice } from '../../../models/interfaces';
import EquipmentListTable from './EquipmentListTable';
import EquipmentListHeader from './EquipmentListHeader';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import { useLocalStorageState } from '../../../lib/useLocalStorageState';

type Props = {
    bookingId: number;
    list: Partial<EquipmentList>;
    readonly: boolean;
    deleteListFn: (x: EquipmentList) => void;
    moveListFn: (x: EquipmentList, direction: 'UP' | 'DOWN') => void;
    isFirstFn: (x: EquipmentList) => boolean;
    isLastFn: (x: EquipmentList) => boolean;
    globalSettings: KeyValue[];
};

const EquipmentListDisplay: React.FC<Props> = ({
    list: partialList,
    bookingId,
    deleteListFn: parentDeleteListFn,
    moveListFn: parentMoveListFn,
    isFirstFn: parentIsFirstFn,
    isLastFn: parentIsLastFn,
    readonly,
    globalSettings,
}: Props) => {
    const { data: booking, mutate, error } = useSwr('/api/bookings/' + bookingId, (url) => bookingFetcher(url));

    const { showSaveSuccessNotification, showSaveFailedNotification } = useNotifications();

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

    // On edit-modal save
    const onEditModalSave = (entryToSave: EquipmentListEntry, isNew: boolean) => {
        if (!isNew) {
            updateListEntry(entryToSave, list, saveList);
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
                    showListContent={false}
                    saveList={saveList}
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
                    pricePlan={booking.pricePlan}
                    language={booking.language}
                    saveList={saveList}
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
