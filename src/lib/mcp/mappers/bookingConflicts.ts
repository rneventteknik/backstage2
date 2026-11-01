import { BookingViewModel, Equipment } from '../../../models/interfaces';
import { EquipmentList } from '../../../models/interfaces/EquipmentList';
import { formatDatetimeForAnalyticsExport, getEquipmentInDatetime, getEquipmentOutDatetime } from '../../datetimeUtils';
import { getMaximumNumberOfUnitUsed, listContainsEquipment } from '../../utils';
import { toMcpBookingSummary } from './bookingSummary';
import { getLinkToBooking, getLinkToEquipment } from './primitives';

// Conflict statuses, matching the icons and tooltips next to each row in the equipment lists in Backstage2.
export const CONFLICT_STATUS = {
    none: 'Ingen konflikt',
    shared: 'Delas med andra listor',
    conflict: 'Konflikt',
    exceedsInventory: 'Fler än inventarieantalet',
} as const;
type ConflictStatus = (typeof CONFLICT_STATUS)[keyof typeof CONFLICT_STATUS];

const overlaps = (a: EquipmentList, b: EquipmentList): boolean => {
    const aOut = getEquipmentOutDatetime(a);
    const aIn = getEquipmentInDatetime(a);
    const bOut = getEquipmentOutDatetime(b);
    const bIn = getEquipmentInDatetime(b);
    return !!aOut && !!aIn && !!bOut && !!bIn && aOut <= bIn && aIn >= bOut;
};

const hasDatetimes = (list: EquipmentList): boolean =>
    !!getEquipmentOutDatetime(list) && !!getEquipmentInDatetime(list);

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
    (booking.equipmentLists ?? []).filter(hasDatetimes);

// Mirrors EquipmentListEntryConflictStatus: units used by overlapping lists (other bookings' lists as well as this
// booking's other lists) are added to the units this list uses and compared to the inventory count.
const toMcpEquipmentConflict = (
    booking: BookingViewModel,
    list: EquipmentList,
    equipment: Equipment,
    otherBookings: BookingViewModel[],
    canSeePii: boolean,
) => {
    const inventoryCount = equipment.inventoryCount ?? 0;
    const ownOverlappingLists = getCheckableEquipmentLists(booking).filter(
        (other) => other.id !== list.id && listContainsEquipment(other, equipment) && overlaps(other, list),
    );
    const overlappingBookings = [
        ...(ownOverlappingLists.length > 0 ? [{ booking, lists: ownOverlappingLists }] : []),
        ...otherBookings
            .map((other) => ({
                booking: other,
                lists: (other.equipmentLists ?? []).filter((other) => overlaps(other, list)),
            }))
            .filter((x) => x.lists.length > 0),
    ];

    const unitsUsedByThisList = getMaximumNumberOfUnitUsed([list], equipment);
    const unitsUsedByOthers = getMaximumNumberOfUnitUsed(
        overlappingBookings.flatMap((x) => x.lists),
        equipment,
    );
    const maxUnitsBooked = unitsUsedByThisList + unitsUsedByOthers;

    const conflictStatus: ConflictStatus =
        unitsUsedByThisList > inventoryCount
            ? CONFLICT_STATUS.exceedsInventory
            : maxUnitsBooked > inventoryCount
              ? CONFLICT_STATUS.conflict
              : unitsUsedByOthers > 0
                ? CONFLICT_STATUS.shared
                : CONFLICT_STATUS.none;

    return {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        link: getLinkToEquipment(equipment.id),
        conflictStatus,
        numberOfUnits: unitsUsedByThisList,
        maxUnitsBooked,
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
    const isProblem = (row: { conflictStatus: ConflictStatus }) =>
        row.conflictStatus === CONFLICT_STATUS.conflict || row.conflictStatus === CONFLICT_STATUS.exceedsInventory;

    return {
        id: booking.id,
        name: booking.name,
        link: getLinkToBooking(booking.id),
        checkedRowsCount: allRows.length,
        conflictCount: allRows.filter(isProblem).length,
        skippedEquipmentLists: (booking.equipmentLists ?? [])
            .filter((list) => !hasDatetimes(list))
            .map((list) => ({ id: list.id, name: list.name })),
        equipmentLists: equipmentLists
            .map((list) => ({
                ...list,
                rows: includeAll ? list.rows : list.rows.filter((row) => row.conflictStatus !== CONFLICT_STATUS.none),
            }))
            .filter((list) => includeAll || list.rows.length > 0),
    };
};
