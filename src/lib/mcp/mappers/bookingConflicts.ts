import { BookingViewModel } from '../../../models/interfaces';
import { formatDatetimeForAnalyticsExport, getEquipmentInDatetime, getEquipmentOutDatetime } from '../../datetimeUtils';
import {
    EquipmentConflictStatus,
    EquipmentListConflict,
    EquipmentUsageBooking,
    equipmentListHasDatetimes,
} from '../../equipmentConflicts';
import { getRentalStatusName } from '../../utils';
import { toMcpBookingSummary } from './bookingSummary';
import { getLinkToBooking, getLinkToEquipment } from './primitives';

// Conflict statuses, matching the icons and tooltips next to each row in the equipment lists in Backstage2.
export const CONFLICT_STATUS_NAMES: Record<EquipmentConflictStatus, string> = {
    [EquipmentConflictStatus.NONE]: 'Inga konflikter',
    [EquipmentConflictStatus.SHARED]: 'Delas med andra listor',
    [EquipmentConflictStatus.CONFLICT]: 'Konflikt',
    [EquipmentConflictStatus.EXCEEDS_INVENTORY]: 'Fler än inventarieantalet',
};

const PROBLEM_STATUSES = [EquipmentConflictStatus.CONFLICT, EquipmentConflictStatus.EXCEEDS_INVENTORY];

// The bookings in the usage, summarised with the full bookings from bookingsById.
export const toMcpEquipmentUsageBookings = (
    bookings: EquipmentUsageBooking[],
    bookingsById: Map<number, BookingViewModel>,
    canSeePii: boolean,
) =>
    bookings.map((booking) => ({
        ...toMcpBookingSummary(bookingsById.get(booking.id)!, canSeePii),
        equipmentLists: booking.equipmentLists.map((list) => ({
            id: list.id,
            name: list.name,
            rentalStatus: list.rentalStatus != null ? getRentalStatusName(list.rentalStatus) : null,
            equipmentOutDatetime: formatDatetimeForAnalyticsExport(list.equipmentOutDatetime),
            equipmentInDatetime: formatDatetimeForAnalyticsExport(list.equipmentInDatetime),
            numberOfUnits: list.numberOfUnits,
        })),
    }));

const toMcpEquipmentConflict = (
    conflict: EquipmentListConflict,
    bookingsById: Map<number, BookingViewModel>,
    canSeePii: boolean,
) => ({
    equipmentId: conflict.equipmentId,
    equipmentName: conflict.equipmentName,
    link: getLinkToEquipment(conflict.equipmentId),
    conflictStatus: CONFLICT_STATUS_NAMES[conflict.status],
    numberOfUnits: conflict.numberOfUnits,
    maxUnitsBooked: conflict.maxUnitsUsed,
    inventoryCount: conflict.inventoryCount,
    bookings: toMcpEquipmentUsageBookings(conflict.overlappingBookings, bookingsById, canSeePii),
});

// conflicts come from fetchEquipmentConflictsForBooking; bookingsById holds the booking and every overlapping booking.
export const toMcpBookingConflicts = (
    booking: BookingViewModel,
    conflicts: EquipmentListConflict[],
    bookingsById: Map<number, BookingViewModel>,
    includeAll: boolean,
    canSeePii: boolean,
) => {
    const equipmentLists = (booking.equipmentLists ?? []).filter(equipmentListHasDatetimes).map((list) => ({
        id: list.id,
        name: list.name,
        equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(list)),
        equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(list)),
        rows: conflicts
            .filter((conflict) => conflict.equipmentListId === list.id)
            .map((conflict) => toMcpEquipmentConflict(conflict, bookingsById, canSeePii)),
    }));

    return {
        id: booking.id,
        name: booking.name,
        link: getLinkToBooking(booking.id),
        checkedRowsCount: conflicts.length,
        conflictCount: conflicts.filter((conflict) => PROBLEM_STATUSES.includes(conflict.status)).length,
        skippedEquipmentLists: (booking.equipmentLists ?? [])
            .filter((list) => !equipmentListHasDatetimes(list))
            .map((list) => ({ id: list.id, name: list.name })),
        equipmentLists: equipmentLists
            .map((list) => ({
                ...list,
                rows: includeAll
                    ? list.rows
                    : list.rows.filter(
                          (row) => row.conflictStatus !== CONFLICT_STATUS_NAMES[EquipmentConflictStatus.NONE],
                      ),
            }))
            .filter((list) => includeAll || list.rows.length > 0),
    };
};
