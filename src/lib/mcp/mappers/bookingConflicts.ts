import { BookingViewModel } from '../../../models/interfaces';
import { EquipmentConflictOverlap, EquipmentConflictRow } from '../../db-access/equipmentConflicts';
import { formatDatetimeForAnalyticsExport, getEquipmentInDatetime, getEquipmentOutDatetime } from '../../datetimeUtils';
import { EquipmentConflictStatus, equipmentListHasDatetimes } from '../../equipmentConflicts';
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

const toMcpEquipmentConflict = (
    row: EquipmentConflictRow,
    overlaps: EquipmentConflictOverlap[],
    bookingsById: Map<number, BookingViewModel>,
    canSeePii: boolean,
) => {
    const overlapsByBookingId = new Map<number, EquipmentConflictOverlap[]>();
    overlaps.forEach((x) =>
        overlapsByBookingId.set(x.otherBookingId, [...(overlapsByBookingId.get(x.otherBookingId) ?? []), x]),
    );

    return {
        equipmentId: row.equipmentId,
        equipmentName: row.equipmentName,
        link: getLinkToEquipment(row.equipmentId),
        conflictStatus: CONFLICT_STATUS_NAMES[row.status],
        numberOfUnits: row.numberOfUnits,
        maxUnitsBooked: row.numberOfUnits + row.unitsUsedByOthers,
        inventoryCount: row.inventoryCount,
        bookings: [...overlapsByBookingId].map(([bookingId, lists]) => ({
            ...toMcpBookingSummary(bookingsById.get(bookingId)!, canSeePii),
            equipmentLists: lists.map((other) => ({
                id: other.otherEquipmentListId,
                name: other.otherEquipmentListName,
                equipmentOutDatetime: formatDatetimeForAnalyticsExport(other.equipmentOutDatetime),
                equipmentInDatetime: formatDatetimeForAnalyticsExport(other.equipmentInDatetime),
                numberOfUnits: other.numberOfUnits,
            })),
        })),
    };
};

// rows and overlaps come from fetchEquipmentConflictsForBooking; bookingsById holds the booking and every booking in
// overlaps, with their equipment lists.
export const toMcpBookingConflicts = (
    booking: BookingViewModel,
    rows: EquipmentConflictRow[],
    overlaps: EquipmentConflictOverlap[],
    bookingsById: Map<number, BookingViewModel>,
    includeAll: boolean,
    canSeePii: boolean,
) => {
    const equipmentLists = (booking.equipmentLists ?? []).filter(equipmentListHasDatetimes).map((list) => ({
        id: list.id,
        name: list.name,
        equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(list)),
        equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(list)),
        rows: rows
            .filter((row) => row.equipmentListId === list.id)
            .map((row) =>
                toMcpEquipmentConflict(
                    row,
                    overlaps.filter((x) => x.equipmentListId === list.id && x.equipmentId === row.equipmentId),
                    bookingsById,
                    canSeePii,
                ),
            ),
    }));

    return {
        id: booking.id,
        name: booking.name,
        link: getLinkToBooking(booking.id),
        checkedRowsCount: rows.length,
        conflictCount: rows.filter((row) => PROBLEM_STATUSES.includes(row.status)).length,
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
