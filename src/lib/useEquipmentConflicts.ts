import { useCallback, useEffect, useRef } from 'react';
import useSwr, { useSWRConfig } from 'swr';
import { equipmentConflictsFetcher } from './fetchers';

const getEquipmentConflictsKey = (bookingId: number) =>
    '/api/conflict-detection/booking-conflicts?bookingId=' + bookingId;

// The conflict status of every equipment on every equipment list in the booking, as saved on the server.
export const useEquipmentConflicts = (bookingId: number) =>
    useSwr(getEquipmentConflictsKey(bookingId), equipmentConflictsFetcher);

export const useReloadEquipmentConflicts = (bookingId: number) => {
    const { mutate } = useSWRConfig();
    return useCallback(() => mutate(getEquipmentConflictsKey(bookingId)), [bookingId, mutate]);
};

// Conflicts are checked against the lists saved on the server. Changes to the lists are saved right away, after which
// the booking is reloaded, so reloading the conflicts each time the booking has been reloaded keeps them up to date.
export const useReloadEquipmentConflictsWithBooking = (bookingId: number, bookingIsValidating: boolean) => {
    const reloadEquipmentConflicts = useReloadEquipmentConflicts(bookingId);
    const bookingWasValidating = useRef(bookingIsValidating);

    useEffect(() => {
        if (bookingWasValidating.current && !bookingIsValidating) {
            reloadEquipmentConflicts();
        }
        bookingWasValidating.current = bookingIsValidating;
    }, [bookingIsValidating, reloadEquipmentConflicts]);
};
