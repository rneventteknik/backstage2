import { RentalStatus } from '../models/enums/RentalStatus';
import { Status } from '../models/enums/Status';
import { EquipmentList } from '../models/interfaces/EquipmentList';
import { getEquipmentInDatetime, getEquipmentOutDatetime } from './datetimeUtils';

// Conflict detection runs in the database (lib/db-access/equipmentConflicts), so that the equipment list icons, the
// equipment calendar, the number of units modal and the MCP tools all use the same rules. This file only holds the
// result types, which are shared with the client.

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

export const equipmentListHasDatetimes = (list: EquipmentList): boolean =>
    !!getEquipmentOutDatetime(list) && !!getEquipmentInDatetime(list);

// An equipment list using the equipment, with the number of units of it on the list.
export interface EquipmentUsageList {
    id: number;
    name: string;
    rentalStatus: RentalStatus | null;
    equipmentOutDatetime: Date;
    equipmentInDatetime: Date;
    numberOfUnits: number;
}

// A booking using the equipment, with the most units its lists use at the same time.
export interface EquipmentUsageBooking {
    id: number;
    name: string;
    status: Status;
    maxUnitsUsed: number;
    equipmentLists: EquipmentUsageList[];
}

// The bookings using an equipment during a period, and the most units they use at the same time.
export interface EquipmentUsage {
    maxUnitsUsed: number;
    bookings: EquipmentUsageBooking[];
}

// The conflict status of one equipment on one equipment list.
export interface EquipmentListConflict {
    bookingId: number;
    equipmentListId: number;
    equipmentId: number;
    equipmentName: string;
    inventoryCount: number;
    // Units of the equipment on this list.
    numberOfUnits: number;
    // The most units used at the same time by the other lists overlapping this one.
    unitsUsedByOthers: number;
    // numberOfUnits + unitsUsedByOthers.
    maxUnitsUsed: number;
    status: EquipmentConflictStatus;
    // The other lists overlapping this one, grouped by booking. Lists in the same booking come first.
    overlappingBookings: EquipmentUsageBooking[];
}

// Dates are sent as strings over the API.
const toEquipmentUsageList = (list: EquipmentUsageList): EquipmentUsageList => ({
    ...list,
    equipmentOutDatetime: new Date(list.equipmentOutDatetime),
    equipmentInDatetime: new Date(list.equipmentInDatetime),
});

export const toEquipmentUsageBooking = (booking: EquipmentUsageBooking): EquipmentUsageBooking => ({
    ...booking,
    equipmentLists: booking.equipmentLists.map(toEquipmentUsageList),
});
