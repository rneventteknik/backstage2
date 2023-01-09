import React from 'react';
import { Button, Card } from 'react-bootstrap';
import useSwr from 'swr';
import { bookingFetcher } from '../../../lib/fetchers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { getResponseContentOrError, updateItemsInArrayById } from '../../../lib/utils';
import {
    EquipmentListObjectionModel,
    IEquipmentListObjectionModel,
} from '../../../models/objection-models/BookingObjectionModel';
import { toEquipmentList } from '../../../lib/mappers/booking';
import { useNotifications } from '../../../lib/useNotifications';
import Skeleton from 'react-loading-skeleton';
import {
    getNextSortIndex,
    getSortedList,
    isFirst,
    isLast,
    moveItemDown,
    moveItemUp,
} from '../../../lib/sortIndexUtils';
import EquipmentListDisplay from './EquipmentList';
import { KeyValue } from '../../../models/interfaces/KeyValue';

type Props = {
    bookingId: number;
    readonly: boolean;
    globalSettings: KeyValue[];
};

// This component only contains logic to create and delete lists. Everything else
// is handled by the EquipmentListDisplay component which manages it's list internally.
//
const EquipmentLists: React.FC<Props> = ({ bookingId, readonly, globalSettings }: Props) => {
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
                    globalSettings={globalSettings}
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

export default EquipmentLists;
