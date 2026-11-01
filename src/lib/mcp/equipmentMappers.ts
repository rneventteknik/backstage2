import { BookingViewModel, Equipment, EquipmentPrice } from '../../models/interfaces';
import { EquipmentChangelogEntry } from '../../models/interfaces/ChangeLogEntry';
import { EquipmentList } from '../../models/interfaces/EquipmentList';
import { BookingsByUsageTime } from '../bookingFilters';
import { formatDatetimeForAnalyticsExport, getEquipmentInDatetime, getEquipmentOutDatetime } from '../datetimeUtils';
import { getMaximumNumberOfUnitUsed, getRentalStatusName } from '../utils';
import { toMcpBookingSummary, toMcpPrice } from './bookingMappers';

// The equipment page only lists the most recent part of long histories, and so does the MCP.
const MAX_PAST_BOOKINGS = 10;
const MAX_CHANGELOG_ENTRIES = 50;

const getLinkToEquipment = (equipmentId: number): string =>
    process.env.APPLICATION_BASE_URL + '/equipment/' + equipmentId;

const toMcpEquipmentPrice = (price: EquipmentPrice) => ({
    name: price.name,
    pricePerUnit: toMcpPrice(price.pricePerUnit),
    pricePerHour: toMcpPrice(price.pricePerHour),
    pricePerUnitTHS: toMcpPrice(price.pricePerUnitTHS),
    pricePerHourTHS: toMcpPrice(price.pricePerHourTHS),
});

export const toMcpEquipmentSummary = (equipment: Equipment) => ({
    id: equipment.id,
    name: equipment.name,
    nameEN: equipment.nameEN,
    link: getLinkToEquipment(equipment.id),
    inventoryCount: equipment.inventoryCount,
    location: equipment.equipmentLocation?.name ?? null,
    equipmentPublicCategory: equipment.equipmentPublicCategory?.name ?? null,
    equipmentTags: equipment.tags.map((tag) => tag.name),
    publiclyVisible: !equipment.publiclyHidden,
    isArchived: Boolean(equipment.isArchived),
    prices: [...equipment.prices].sort((a, b) => a.id - b.id).map(toMcpEquipmentPrice),
});

const toMcpEquipmentChangelogEntry = (entry: EquipmentChangelogEntry) => ({
    description: entry.name,
    updated: formatDatetimeForAnalyticsExport(entry.updated),
});

// How many units of the equipment a booking uses at most at the same time, over all its equipment lists.
const toMcpEquipmentBooking = (booking: BookingViewModel, equipment: Equipment, canSeePii: boolean) => ({
    ...toMcpBookingSummary(booking, canSeePii),
    numberOfUnits: getMaximumNumberOfUnitUsed(booking.equipmentLists ?? [], equipment),
});

const sortByEquipmentOut = (bookings: BookingViewModel[], descending = false) =>
    [...bookings].sort(
        (a, b) =>
            ((a.equipmentOutDatetime?.getTime() ?? 0) - (b.equipmentOutDatetime?.getTime() ?? 0)) *
            (descending ? -1 : 1),
    );

export const toMcpEquipmentDetail = (equipment: Equipment, bookings: BookingsByUsageTime, canSeePii: boolean) => ({
    ...toMcpEquipmentSummary(equipment),
    description: equipment.description,
    descriptionEN: equipment.descriptionEN,
    searchKeywords: equipment.searchKeywords,
    note: equipment.note,
    currentBookings: sortByEquipmentOut(bookings.currentBookings).map((x) =>
        toMcpEquipmentBooking(x, equipment, canSeePii),
    ),
    upcomingBookings: sortByEquipmentOut(bookings.futureBookings).map((x) =>
        toMcpEquipmentBooking(x, equipment, canSeePii),
    ),
    pastBookingsCount: bookings.pastBookings.length,
    pastBookings: sortByEquipmentOut(bookings.pastBookings, true)
        .slice(0, MAX_PAST_BOOKINGS)
        .map((x) => toMcpEquipmentBooking(x, equipment, canSeePii)),
    // Changelog entries name the members who made the changes.
    ...(canSeePii
        ? { changelog: equipment.changelog.slice(0, MAX_CHANGELOG_ENTRIES).map(toMcpEquipmentChangelogEntry) }
        : {}),
});

export const toMcpEquipmentSearchResult = (equipment: Equipment[], nextMaxEquipmentId: number | null) => ({
    equipment: equipment.map(toMcpEquipmentSummary),
    nextMaxEquipmentId,
});

const toMcpAvailabilityEquipmentList = (list: EquipmentList, equipment: Equipment) => ({
    id: list.id,
    name: list.name,
    rentalStatus: list.rentalStatus != null ? getRentalStatusName(list.rentalStatus) : null,
    equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(list)),
    equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(list)),
    numberOfUnits: getMaximumNumberOfUnitUsed([list], equipment),
});

export const toMcpEquipmentAvailability = (
    equipment: Equipment,
    from: Date,
    to: Date,
    bookings: BookingViewModel[],
    canSeePii: boolean,
) => {
    const equipmentLists = bookings.flatMap((booking) => booking.equipmentLists ?? []);
    const maxUnitsBooked = getMaximumNumberOfUnitUsed(equipmentLists, equipment);

    return {
        id: equipment.id,
        name: equipment.name,
        link: getLinkToEquipment(equipment.id),
        from: from.toISOString(),
        to: to.toISOString(),
        inventoryCount: equipment.inventoryCount,
        maxUnitsBooked,
        availableUnits: equipment.inventoryCount !== null ? equipment.inventoryCount - maxUnitsBooked : null,
        bookings: bookings.map((booking) => ({
            ...toMcpBookingSummary(booking, canSeePii),
            equipmentLists: (booking.equipmentLists ?? []).map((list) =>
                toMcpAvailabilityEquipmentList(list, equipment),
            ),
        })),
    };
};
