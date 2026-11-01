import { McpRequestContext, McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { BookingType } from '../../models/enums/BookingType';
import { Status } from '../../models/enums/Status';
import { BookingViewModel } from '../../models/interfaces';
import { toBookingViewModel } from '../datetimeUtils';
import { filterBookings, groupBookingsByEquipmentUsageTime } from '../bookingFilters';
import { fetchBookings, searchBookings } from '../db-access';
import {
    fetchBookingForMcp,
    fetchBookingsForEquipment,
    fetchBookingsWithEquipmentInInterval,
} from '../db-access/booking';
import { fetchEquipment, fetchEquipments, searchEquipment } from '../db-access/equipment';
import { fetchSettings } from '../db-access/setting';
import { fetchUserNamesAndTags } from '../db-access/user';
import { getCalendarEvent } from '../calenderUtils';
import { toBooking } from '../mappers/booking';
import { toEquipment } from '../mappers/equipment';
import { getBookingTypeName, getGlobalSetting, getStatusName } from '../utils';
import { toMcpBookingDetail, toMcpBookingSearchResult, toMcpCalendarEvent } from './mappers/bookingDetail';
import { getFirstName, PII_SCOPE } from './mappers/primitives';
import {
    toMcpEquipmentAvailability,
    toMcpEquipmentDetail,
    toMcpEquipmentSearchResult,
} from './mappers/equipmentDetail';
import { toSwedishKeys } from './swedishKeys';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
// searchBookings returns the most recently updated matches first, so this bounds how far back a free-text search reaches.
const SEARCH_RESULT_LIMIT = 1000;
// Equipment search is only used to find matching ids within the full equipment list, so it can include all matches.
const EQUIPMENT_SEARCH_RESULT_LIMIT = 10000;

const SORT_BY_OPTIONS = ['created', 'usageStart'] as const;
type SortBy = (typeof SORT_BY_OPTIONS)[number];

// Filters take the same Swedish display names as the response data, e.g. 'Bokad' or 'Gigg'.
const statusByName = new Map(
    [Status.DRAFT, Status.BOOKED, Status.DONE, Status.CANCELED].map((status) => [getStatusName(status), status]),
);
const bookingTypeByName = new Map(
    [BookingType.RENTAL, BookingType.GIG].map((bookingType) => [getBookingTypeName(bookingType), bookingType]),
);
const statusNames = [...statusByName.keys()] as [string, ...string[]];
const bookingTypeNames = [...bookingTypeByName.keys()] as [string, ...string[]];
const [draftName, bookedName, doneName, canceledName] = statusNames;

const getSortDatetime = (booking: BookingViewModel, sortBy: SortBy): Date | undefined => {
    switch (sortBy) {
        case 'created':
            return booking.created;
        case 'usageStart':
            return booking.usageStartDatetime;
    }
};

// Newest first; bookings missing the sort datetime go last. Id descending breaks ties.
const compareBookingsBy =
    (sortBy: SortBy) =>
    (a: BookingViewModel, b: BookingViewModel): number => {
        const aDate = getSortDatetime(a, sortBy);
        const bDate = getSortDatetime(b, sortBy);
        if (!aDate && !bDate) {
            return b.id - a.id;
        }
        if (!aDate) {
            return 1;
        }
        if (!bDate) {
            return -1;
        }
        const diff = bDate.getTime() - aDate.getTime();
        return diff !== 0 ? diff : b.id - a.id;
    };

const toJsonResult = (result: object) => {
    const translatedResult = toSwedishKeys(result) as Record<string, unknown>;
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(translatedResult) }],
        structuredContent: translatedResult,
    };
};

const matchesName = (name: string | undefined, filter: string | undefined) =>
    !filter || name?.toLowerCase() === filter.trim().toLowerCase();

const toErrorResult = (message: string) => ({
    content: [{ type: 'text' as const, text: message }],
    isError: true,
});

// Matches each name tag or name to exactly one user: an exact name tag, then an exact name, then a unique partial
// name. Returns an error message for entries that match no user or several users. Without access to personal data,
// names are matched and listed by first name only, so the filter can't be used to look up full names.
const resolveUserIds = async (
    namesOrTags: string[],
    canSeePii: boolean,
): Promise<{ userIds: number[] } | { error: string }> => {
    const users = (await fetchUserNamesAndTags()).map((user) => ({
        ...user,
        name: canSeePii ? user.name : getFirstName(user.name),
    }));
    const formatUser = (user: { name: string; nameTag?: string }) => `${user.name} (${user.nameTag ?? '-'})`;

    const userIds: number[] = [];
    const errors: string[] = [];

    for (const nameOrTag of namesOrTags) {
        const searchString = nameOrTag.trim().toLowerCase();
        const exactMatch =
            users.find((user) => user.nameTag?.toLowerCase() === searchString) ??
            users.find((user) => user.name.toLowerCase() === searchString);
        const candidates = exactMatch
            ? [exactMatch]
            : users.filter((user) => user.name.toLowerCase().includes(searchString));

        if (candidates.length === 1) {
            userIds.push(candidates[0].id!);
        } else if (candidates.length === 0) {
            errors.push(`No user matches "${nameOrTag}".`);
        } else {
            errors.push(`"${nameOrTag}" matches several users: ${candidates.map(formatUser).join(', ')}.`);
        }
    }

    return errors.length > 0 ? { error: errors.join(' ') } : { userIds };
};

export const createMcpServer = (ctx: McpRequestContext): McpServer => {
    const canSeePii = ctx.authInfo?.scopes.includes(PII_SCOPE) ?? false;
    const personalDataDescription = canSeePii
        ? ''
        : ' Personal data is limited: people are listed by first name only, customer contact details and the ' +
          'changelog are not included, and the customer name (kundnamn) is only included for customers with a ' +
          'Hogia ID (hogiaId).';

    const server = new McpServer({
        name: 'backstage2',
        version: process.env.NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION ?? 'unknown',
    });

    server.registerTool(
        'search_bookings',
        {
            title: 'Search bookings',
            description:
                'Search and list bookings, newest first by creation time by default (sortBy=created). Without a ' +
                'query all bookings matching the filters are listed. The query matches booking name, contact ' +
                'person name, invoice number and customer name, and every word must match. A query searches the ' +
                `${SEARCH_RESULT_LIMIT} most recently updated matching bookings. Use from/to to filter on usage ` +
                'dates and createdFrom/createdTo to filter on creation time. Use get_booking for full details on ' +
                'a booking. Field names and values are in Swedish, matching the Backstage2 user interface.\n\n' +
                `Booking statuses: ${draftName} (draft, not yet confirmed), ${bookedName} (confirmed), ` +
                `${doneName} (finished, possibly still to be invoiced) and ${canceledName} (cancelled). Active ` +
                `bookings are those with status ${draftName} or ${bookedName}, so filter with status ` +
                `["${draftName}", "${bookedName}"] to get only active bookings, or ["${doneName}", ` +
                `"${canceledName}"] for inactive ones.` +
                personalDataDescription,
            inputSchema: z.object({
                query: z.string().optional().describe('Free-text search string'),
                status: z
                    .array(z.enum(statusNames))
                    .optional()
                    .describe(
                        `Only include bookings with these statuses. Use ["${draftName}", "${bookedName}"] for ` +
                            'active bookings.',
                    ),
                bookingType: z.enum(bookingTypeNames).optional(),
                responsibleUser: z
                    .array(z.string())
                    .optional()
                    .describe(
                        'Only include bookings whose responsible member (ansvarigMedlem) matches one of these name ' +
                            'tags (e.g. "PJ") or names, as listed in ansvarigMedlem. Like the other filters, it is applied to the ' +
                            `${SEARCH_RESULT_LIMIT} bookings a query searches.`,
                    ),
                from: z.iso.date().optional().describe('Only include bookings whose usage starts after this date'),
                to: z.iso.date().optional().describe('Only include bookings whose usage ends before this date'),
                createdFrom: z.iso.date().optional().describe('Only include bookings created after this date'),
                createdTo: z.iso.date().optional().describe('Only include bookings created before this date'),
                sortBy: z
                    .enum(SORT_BY_OPTIONS)
                    .default('created')
                    .describe(
                        'Sort newest first by creation time (created) or usage start (usageStart). Defaults to created.',
                    ),
                pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
                offset: z
                    .number()
                    .int()
                    .min(0)
                    .default(0)
                    .describe(
                        'Number of bookings to skip. Use nästaOffset from the previous response to get the next ' +
                            'page.',
                    ),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({
            query,
            status,
            bookingType,
            responsibleUser,
            from,
            to,
            createdFrom,
            createdTo,
            sortBy,
            pageSize,
            offset,
        }) => {
            const [bookings, resolvedUsers] = await Promise.all([
                query?.trim() ? searchBookings(query, SEARCH_RESULT_LIMIT) : fetchBookings(),
                responsibleUser?.length ? resolveUserIds(responsibleUser, canSeePii) : undefined,
            ]);

            if (resolvedUsers && 'error' in resolvedUsers) {
                return toErrorResult(resolvedUsers.error);
            }

            const matchingBookings = filterBookings(bookings.map(toBooking).map(toBookingViewModel), {
                userIds: resolvedUsers?.userIds,
                statuses: status?.map((name) => statusByName.get(name)!),
                bookingType: bookingType !== undefined ? bookingTypeByName.get(bookingType) : undefined,
                startDate: from ? new Date(from) : undefined,
                endDate: to ? new Date(to) : undefined,
                createdFrom: createdFrom ? new Date(createdFrom) : undefined,
                createdTo: createdTo ? new Date(createdTo) : undefined,
            }).sort(compareBookingsBy(sortBy));

            const page = matchingBookings.slice(offset, offset + pageSize);
            const nextOffset = offset + pageSize < matchingBookings.length ? offset + pageSize : null;

            return toJsonResult(toMcpBookingSearchResult(page, nextOffset, canSeePii));
        },
    );

    server.registerTool(
        'get_booking',
        {
            title: 'Get booking',
            description:
                'Get all details about a booking: people, customer and invoice information, notes, pricing, ' +
                'equipment lists with prices, time estimates, time reports, the latest changelog entries and ' +
                'linked calendar events. Prices are in SEK, both excluding (exklMoms) and including (inklMoms) ' +
                'VAT. Field names and values are in Swedish, matching the Backstage2 user interface.' +
                personalDataDescription,
            inputSchema: z.object({
                bookingId: z.number().int(),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ bookingId }) => {
            const [bookingModel, globalSettings] = await Promise.all([fetchBookingForMcp(bookingId), fetchSettings()]);

            if (!bookingModel) {
                return toErrorResult(`Booking ${bookingId} not found`);
            }

            const booking = toBookingViewModel(toBooking(bookingModel));

            // Calendar events live in Google Calendar; an event that cannot be fetched is still listed by id.
            const calendarEvents = await Promise.all(
                (booking.calendarEvents ?? []).map(({ calendarEventId }) =>
                    getCalendarEvent(calendarEventId)
                        .then((event) => toMcpCalendarEvent(event, canSeePii))
                        .catch(() => toMcpCalendarEvent({ id: calendarEventId, workingUsers: [] }, canSeePii)),
                ),
            );

            return toJsonResult(
                toMcpBookingDetail(
                    booking,
                    {
                        equipmentExternal: getGlobalSetting(
                            'accounts.defaultEquipmentAccount.external',
                            globalSettings,
                        ),
                        equipmentInternal: getGlobalSetting(
                            'accounts.defaultEquipmentAccount.internal',
                            globalSettings,
                        ),
                    },
                    calendarEvents,
                    canSeePii,
                ),
            );
        },
    );

    server.registerTool(
        'search_equipment',
        {
            title: 'Search equipment',
            description:
                'Search and list equipment in the inventory, newest first. Archived equipment is not included. ' +
                'Without a query all equipment matching the filters is listed. The query matches the Swedish ' +
                'name, English name and search keywords, and every word must match. Use get_equipment for full ' +
                'details and bookings of a piece of equipment, and get_equipment_availability to check how many ' +
                'units are free during a time period. Field names and values are in Swedish, matching the ' +
                'Backstage2 user interface. Prices are in SEK, both excluding (exklMoms) and including (inklMoms) ' +
                'VAT; the THS prices are used for bookings with the THS price plan.',
            inputSchema: z.object({
                query: z.string().optional().describe('Free-text search string'),
                tag: z.string().optional().describe('Only include equipment with this tag (taggar), e.g. "Ljud"'),
                publicCategory: z
                    .string()
                    .optional()
                    .describe('Only include equipment in this public price list category (publikKategori)'),
                location: z.string().optional().describe('Only include equipment stored at this location (plats)'),
                pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
                offset: z
                    .number()
                    .int()
                    .min(0)
                    .default(0)
                    .describe(
                        'Number of equipment items to skip. Use nästaOffset from the previous response to get the ' +
                            'next page.',
                    ),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ query, tag, publicCategory, location, pageSize, offset }) => {
            const [equipmentModels, searchResult] = await Promise.all([
                fetchEquipments(),
                query?.trim() ? searchEquipment(query, EQUIPMENT_SEARCH_RESULT_LIMIT) : Promise.resolve(null),
            ]);
            const matchingIds = searchResult ? new Set(searchResult.map((x) => x.id)) : null;

            const matchingEquipment = equipmentModels
                .map(toEquipment)
                .filter((equipment) => !matchingIds || matchingIds.has(equipment.id))
                .filter((equipment) => !tag || equipment.tags.some((x) => matchesName(x.name, tag)))
                .filter((equipment) => matchesName(equipment.equipmentPublicCategory?.name, publicCategory))
                .filter((equipment) => matchesName(equipment.equipmentLocation?.name, location))
                .sort((a, b) => b.id - a.id);

            const page = matchingEquipment.slice(offset, offset + pageSize);
            const nextOffset = offset + pageSize < matchingEquipment.length ? offset + pageSize : null;

            return toJsonResult(toMcpEquipmentSearchResult(page, nextOffset));
        },
    );

    server.registerTool(
        'get_equipment',
        {
            title: 'Get equipment',
            description:
                'Get all details about a piece of equipment: names, descriptions, inventory count (inventarieantal), ' +
                'storage location, tags, prices, notes, the latest changelog entries, and the bookings using it. ' +
                'Bookings are grouped as in Backstage2 into current (out right now, or not yet returned), upcoming ' +
                'and past (only the most recent are listed, antalTidigareBokningar is the total). antal on a ' +
                'booking is the most units of this equipment the booking uses at the same time. Prices are in SEK, ' +
                'both excluding (exklMoms) and including (inklMoms) VAT. Field names and values are in Swedish, ' +
                'matching the Backstage2 user interface.' +
                personalDataDescription,
            inputSchema: z.object({
                equipmentId: z.number().int(),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ equipmentId }) => {
            const [equipmentModel, bookingModels] = await Promise.all([
                fetchEquipment(equipmentId),
                fetchBookingsForEquipment(equipmentId),
            ]);

            if (!equipmentModel) {
                return toErrorResult(`Equipment ${equipmentId} not found`);
            }

            const equipment = toEquipment(equipmentModel);
            const bookings = bookingModels.map(toBooking).map(toBookingViewModel);

            return toJsonResult(
                toMcpEquipmentDetail(equipment, groupBookingsByEquipmentUsageTime(bookings, equipment), canSeePii),
            );
        },
    );

    server.registerTool(
        'get_equipment_availability',
        {
            title: 'Get equipment availability',
            description:
                'Check how many units of a piece of equipment are booked and available during a time period, ' +
                'using the same conflict detection as the equipment lists in Backstage2. Lists the bookings ' +
                'whose equipment lists use the equipment during the period, with the number of units (antal) ' +
                'each list uses. Cancelled bookings are not counted. maxAntalBokade is the most units booked at ' +
                'the same time during the period and tillgängligtAntal is the inventory count minus that; both ' +
                'count units in draft bookings. tillgängligtAntal is null when the inventory count is unknown. ' +
                'Field names and values are in Swedish, matching the Backstage2 user interface.' +
                personalDataDescription,
            inputSchema: z.object({
                equipmentId: z.number().int(),
                from: z.iso
                    .datetime({ offset: true })
                    .describe('Start of the period, e.g. "2026-11-07T16:00:00+01:00"'),
                to: z.iso.datetime({ offset: true }).describe('End of the period, e.g. "2026-11-08T12:00:00+01:00"'),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ equipmentId, from, to }) => {
            const fromDate = new Date(from);
            const toDate = new Date(to);

            if (fromDate > toDate) {
                return toErrorResult('from must be before to');
            }

            const [equipmentModel, bookingModels] = await Promise.all([
                fetchEquipment(equipmentId),
                fetchBookingsWithEquipmentInInterval(equipmentId, fromDate, toDate),
            ]);

            if (!equipmentModel) {
                return toErrorResult(`Equipment ${equipmentId} not found`);
            }

            const bookings = bookingModels
                .map(toBooking)
                .map(toBookingViewModel)
                .filter((booking) => booking.status !== Status.CANCELED)
                .sort((a, b) => (a.equipmentOutDatetime?.getTime() ?? 0) - (b.equipmentOutDatetime?.getTime() ?? 0));

            return toJsonResult(
                toMcpEquipmentAvailability(toEquipment(equipmentModel), fromDate, toDate, bookings, canSeePii),
            );
        },
    );

    return server;
};
