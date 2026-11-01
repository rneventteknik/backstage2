import { BookingViewModel, Equipment } from '../../../models/interfaces';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { formatDatetimeForAnalyticsExport, getEquipmentInDatetime, getEquipmentOutDatetime } from '../../datetimeUtils';
import { EquipmentConflictStatus, equipmentListHasDatetimes, getEquipmentListConflict } from '../../equipmentConflicts';
import { getMaximumNumberOfUnitUsed } from '../../utils';
import { toMcpBookingSummary } from './bookingSummary';
import { getLinkToBooking, getLinkToEquipment } from './primitives';

// Conflict statuses, matching the icons and tooltips next to each row in the equipment lists in Backstage2.
export const CONFLICT_STATUS_NAMES: Record<EquipmentConflictStatus, string> = {
    [EquipmentConflictStatus.NONE]: 'Ingen konflikt',
    [EquipmentConflictStatus.SHARED]: 'Delas med andra listor',
    [EquipmentConflictStatus.CONFLICT]: 'Konflikt',
    [EquipmentConflictStatus.EXCEEDS_INVENTORY]: 'Fler än inventarieantalet',
};

// Every equipment in a list with a known inventory count, once per equipment even if it is on several rows.
export const getCheckableEquipment = (list: EquipmentList): Equipment[] => {
    const equipmentById = new Map<number, Equipment>();
    [...list.listEntries, ...list.listHeadings.flatMap((heading) => heading.listEntries)].forEach((entry) => {
        if (entry.equipment && entry.equipment.inventoryCount !== null) {
            equipmentById.set(entry.equipment.id, entry.equipment);
        }
    });
    return [...equipmentById.values()];
};

export const getCheckableEquipmentLists = (booking: BookingViewModel): EquipmentList[] =>
    (booking.equipmentLists ?? []).filter(equipmentListHasDatetimes);

// The same check as the conflict icon next to each row in the equipment lists (EquipmentListEntryConflictStatus).
const toMcpEquipmentConflict = (
    booking: BookingViewModel,
    list: EquipmentList,
    equipment: Equipment,
    otherBookings: BookingViewModel[],
    canSeePii: boolean,
) => {
    const conflict = getEquipmentListConflict(list, equipment, getCheckableEquipmentLists(booking), otherBookings);
    const overlappingBookings = [
        ...(conflict.overlappingLocalLists.length > 0 ? [{ booking, lists: conflict.overlappingLocalLists }] : []),
        ...conflict.overlappingRemoteBookings,
    ];

    return {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        link: getLinkToEquipment(equipment.id),
        // Only equipment with an inventory count is checked, so the status is never null.
        conflictStatus: CONFLICT_STATUS_NAMES[conflict.status!],
        numberOfUnits: conflict.unitsUsedByThisList,
        maxUnitsBooked: conflict.maxUnitsUsed,
        inventoryCount: equipment.inventoryCount,
        bookings: overlappingBookings.map((x) => ({
            ...toMcpBookingSummary(x.booking, canSeePii),
            equipmentLists: x.lists.map((other) => ({
                id: other.id,
                name: other.name,
                equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(other)),
                equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(other)),
                numberOfUnits: getMaximumNumberOfUnitUsed([other], equipment),
            })),
        })),
    };
};

// otherBookingsByEquipmentId holds the other, non-cancelled bookings with lists using each equipment during this
// booking's lists, pruned to those lists.
export const toMcpBookingConflicts = (
    booking: BookingViewModel,
    otherBookingsByEquipmentId: Map<number, BookingViewModel[]>,
    includeAll: boolean,
    canSeePii: boolean,
) => {
    const equipmentLists = getCheckableEquipmentLists(booking).map((list) => {
        const rows = getCheckableEquipment(list).map((equipment) =>
            toMcpEquipmentConflict(
                booking,
                list,
                equipment,
                otherBookingsByEquipmentId.get(equipment.id) ?? [],
                canSeePii,
            ),
        );
        return {
            id: list.id,
            name: list.name,
            equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(list)),
            equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(list)),
            rows,
        };
    });

    const allRows = equipmentLists.flatMap((list) => list.rows);
    const problemStatusNames = [
        CONFLICT_STATUS_NAMES[EquipmentConflictStatus.CONFLICT],
        CONFLICT_STATUS_NAMES[EquipmentConflictStatus.EXCEEDS_INVENTORY],
    ];
    const isProblem = (row: { conflictStatus: string }) => problemStatusNames.includes(row.conflictStatus);

    return {
        id: booking.id,
        name: booking.name,
        link: getLinkToBooking(booking.id),
        checkedRowsCount: allRows.length,
        conflictCount: allRows.filter(isProblem).length,
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
