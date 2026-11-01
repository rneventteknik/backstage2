import { BookingViewModel, Equipment } from '../../../models/interfaces';
import { EquipmentChangelogEntry } from '../../../models/interfaces/ChangeLogEntry';
import { BookingsByUsageTime } from '../../bookingFilters';
import { formatDatetimeForAnalyticsExport } from '../../datetimeUtils';
import { EquipmentUsage } from '../../equipmentConflicts';
import { toMcpEquipmentUsageBookings } from './bookingConflicts';
import { toMcpBookingSummary } from './bookingSummary';
import { toMcpEquipmentSummary } from './equipmentSummary';
import { getLinkToEquipment } from './primitives';

// The equipment page only lists the most recent part of long histories, and so does the MCP.
const MAX_PAST_BOOKINGS = 10;
const MAX_CHANGELOG_ENTRIES = 50;

const toMcpEquipmentChangelogEntry = (entry: EquipmentChangelogEntry) => ({
    description: entry.name,
    updated: formatDatetimeForAnalyticsExport(entry.updated),
});

// unitsPerBooking holds how many units of the equipment each booking uses at most at the same time, over all its
// equipment lists, from fetchEquipmentUnitsPerBooking.
const toMcpEquipmentBooking = (
    booking: BookingViewModel,
    unitsPerBooking: Map<number, number>,
    canSeePii: boolean,
) => ({
    ...toMcpBookingSummary(booking, canSeePii),
    numberOfUnits: unitsPerBooking.get(booking.id) ?? 0,
});

const sortByEquipmentOut = (bookings: BookingViewModel[], descending = false) =>
    [...bookings].sort(
        (a, b) =>
            ((a.equipmentOutDatetime?.getTime() ?? 0) - (b.equipmentOutDatetime?.getTime() ?? 0)) *
            (descending ? -1 : 1),
    );

export const toMcpEquipmentDetail = (
    equipment: Equipment,
    bookings: BookingsByUsageTime,
    unitsPerBooking: Map<number, number>,
    canSeePii: boolean,
) => ({
    ...toMcpEquipmentSummary(equipment),
    description: equipment.description,
    descriptionEN: equipment.descriptionEN,
    searchKeywords: equipment.searchKeywords,
    note: equipment.note,
    currentBookings: sortByEquipmentOut(bookings.currentBookings).map((x) =>
        toMcpEquipmentBooking(x, unitsPerBooking, canSeePii),
    ),
    upcomingBookings: sortByEquipmentOut(bookings.futureBookings).map((x) =>
        toMcpEquipmentBooking(x, unitsPerBooking, canSeePii),
    ),
    pastBookingsCount: bookings.pastBookings.length,
    pastBookings: sortByEquipmentOut(bookings.pastBookings, true)
        .slice(0, MAX_PAST_BOOKINGS)
        .map((x) => toMcpEquipmentBooking(x, unitsPerBooking, canSeePii)),
    // Changelog entries name the members who made the changes.
    ...(canSeePii
        ? { changelog: equipment.changelog.slice(0, MAX_CHANGELOG_ENTRIES).map(toMcpEquipmentChangelogEntry) }
        : {}),
});

export const toMcpEquipmentSearchResult = (equipment: Equipment[], nextOffset: number | null) => ({
    equipment: equipment.map(toMcpEquipmentSummary),
    nextOffset,
});

export const toMcpEquipmentAvailability = (
    equipment: Equipment,
    from: Date,
    to: Date,
    usage: EquipmentUsage,
    bookingsById: Map<number, BookingViewModel>,
    canSeePii: boolean,
) => ({
    id: equipment.id,
    name: equipment.name,
    link: getLinkToEquipment(equipment.id),
    from: from.toISOString(),
    to: to.toISOString(),
    inventoryCount: equipment.inventoryCount,
    maxUnitsBooked: usage.maxUnitsUsed,
    availableUnits: equipment.inventoryCount !== null ? equipment.inventoryCount - usage.maxUnitsUsed : null,
    bookings: toMcpEquipmentUsageBookings(usage.bookings, bookingsById, canSeePii),
});
