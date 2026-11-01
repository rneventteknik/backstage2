import { Status } from '../models/enums/Status';
import { Booking, Equipment } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';
import { getEquipmentInDatetime, getEquipmentOutDatetime } from './datetimeUtils';
import { getMaximumNumberOfUnitUsed, getMaximumNumberOfUnitUsedByBookingLists, listContainsEquipment } from './utils';

export enum EquipmentConflictStatus {
    // No other list uses the equipment at the same time.
    NONE = 'none',
    // Other lists use the equipment at the same time, but there are enough units.
    SHARED = 'shared',
    // More units are used in total than the inventory count.
    CONFLICT = 'conflict',
    // This list alone uses more units than the inventory count.
    EXCEEDS_INVENTORY = 'exceedsInventory',
}

type BookingWithEquipmentLists = Pick<Booking, 'status' | 'equipmentLists'>;

export const equipmentListHasDatetimes = (list: EquipmentList): boolean =>
    !!getEquipmentOutDatetime(list) && !!getEquipmentInDatetime(list);

// Out and in datetimes are inclusive, so a list returned at the same time as another is handed out overlaps it. Lists on
// the same booking are the exception, since the equipment can go straight from one list to the next.
export const equipmentListsOverlap = (a: EquipmentList, b: EquipmentList, sameBooking: boolean): boolean => {
    const aOut = getEquipmentOutDatetime(a);
    const aIn = getEquipmentInDatetime(a);
    const bOut = getEquipmentOutDatetime(b);
    const bIn = getEquipmentInDatetime(b);
    if (!aOut || !aIn || !bOut || !bIn) {
        return false;
    }
    return sameBooking ? aOut < bIn && aIn > bOut : aOut <= bIn && aIn >= bOut;
};

// The most units of the equipment used at the same time by the bookings' equipment lists. Cancelled bookings are not
// counted.
export const getMaximumNumberOfUnitUsedByBookings = (
    bookings: BookingWithEquipmentLists[],
    equipment: Equipment,
): number =>
    getMaximumNumberOfUnitUsedByBookingLists(
        bookings.filter((x) => x.status !== Status.CANCELED).map((x) => x.equipmentLists ?? []),
        equipment,
    );

// Checks the equipment in a list against every list using it at the same time:
// - localLists are the other lists in the same booking. They take precedence over remote lists with the same id, since
//   they may have unsaved changes.
// - remoteBookings are bookings using the equipment, e.g. from /api/conflict-detection/booking-with-equipment.
//   Cancelled bookings are not counted.
// Returns a status of null when the inventory count is unknown, since nothing can be in conflict then.
export const getEquipmentListConflict = <T extends BookingWithEquipmentLists>(
    list: EquipmentList,
    equipment: Equipment,
    localLists: EquipmentList[],
    remoteBookings: T[],
) => {
    const overlapsList = (other: EquipmentList, sameBooking: boolean) =>
        other.id !== list.id && equipmentListsOverlap(other, list, sameBooking);

    const overlappingLocalLists = localLists.filter(
        (other) => overlapsList(other, true) && listContainsEquipment(other, equipment),
    );
    const overlappingRemoteBookings = remoteBookings
        .filter((booking) => booking.status !== Status.CANCELED)
        .map((booking) => ({
            booking,
            lists: (booking.equipmentLists ?? []).filter(
                (other) => overlapsList(other, false) && !localLists.some((x) => x.id === other.id),
            ),
        }))
        .filter((x) => x.lists.length > 0);

    const unitsUsedByThisList = getMaximumNumberOfUnitUsed([list], equipment);
    const unitsUsedByOthers = getMaximumNumberOfUnitUsedByBookingLists(
        [overlappingLocalLists, ...overlappingRemoteBookings.map((x) => x.lists)],
        equipment,
    );
    const maxUnitsUsed = unitsUsedByThisList + unitsUsedByOthers;

    const getStatus = (): EquipmentConflictStatus | null => {
        if (equipment.inventoryCount === null) {
            return null;
        }
        if (unitsUsedByThisList > equipment.inventoryCount) {
            return EquipmentConflictStatus.EXCEEDS_INVENTORY;
        }
        if (maxUnitsUsed > equipment.inventoryCount) {
            return EquipmentConflictStatus.CONFLICT;
        }
        return unitsUsedByOthers > 0 ? EquipmentConflictStatus.SHARED : EquipmentConflictStatus.NONE;
    };

    return {
        status: getStatus(),
        unitsUsedByThisList,
        unitsUsedByOthers,
        maxUnitsUsed,
        overlappingLocalLists,
        overlappingRemoteBookings,
    };
};
