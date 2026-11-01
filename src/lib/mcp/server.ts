import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { BookingType } from '../../models/enums/BookingType';
import { Status } from '../../models/enums/Status';
import { toBookingViewModel } from '../datetimeUtils';
import { filterBookings } from '../bookingFilters';
import { fetchBookings, searchBookings } from '../db-access';
import { fetchBookingForMcp } from '../db-access/booking';
import { fetchSettings } from '../db-access/setting';
import { getCalendarEvent } from '../calenderUtils';
import { toBooking } from '../mappers/booking';
import { getBookingTypeName, getGlobalSetting, getStatusName } from '../utils';
import { toMcpBookingDetail, toMcpBookingSearchResult, toMcpCalendarEvent } from './bookingMappers';
import { toSwedishKeys } from './swedishKeys';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
// searchBookings returns the most recently updated matches first, so this bounds how far back a free-text search reaches.
const SEARCH_RESULT_LIMIT = 1000;

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

const toJsonResult = (result: object) => {
    const translatedResult = toSwedishKeys(result) as Record<string, unknown>;
    return {
        content: [{ type: 'text' as const, text: JSON.stringify(translatedResult) }],
        structuredContent: translatedResult,
    };
};

const toErrorResult = (message: string) => ({
    content: [{ type: 'text' as const, text: message }],
    isError: true,
});

export const createMcpServer = (): McpServer => {
    const server = new McpServer({
        name: 'backstage2',
        version: process.env.NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION ?? 'unknown',
    });

    server.registerTool(
        'search_bookings',
        {
            title: 'Search bookings',
            description:
                'Search and list bookings, newest first. Without a query all bookings matching the filters are ' +
                'listed. The query matches booking name, contact person name, invoice number and customer name, ' +
                `and every word must match. A query searches the ${SEARCH_RESULT_LIMIT} most recently updated ` +
                'matching bookings. Use get_booking for full details on a booking. Field names and values are in ' +
                'Swedish, matching the Backstage2 user interface.\n\n' +
                `Booking statuses: ${draftName} (draft, not yet confirmed), ${bookedName} (confirmed), ` +
                `${doneName} (finished, possibly still to be invoiced) and ${canceledName} (cancelled). Active ` +
                `bookings are those with status ${draftName} or ${bookedName}, so filter with status ` +
                `["${draftName}", "${bookedName}"] to get only active bookings, or ["${doneName}", ` +
                `"${canceledName}"] for inactive ones.`,
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
                from: z.iso.date().optional().describe('Only include bookings whose usage starts after this date'),
                to: z.iso.date().optional().describe('Only include bookings whose usage ends before this date'),
                pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
                maxBookingId: z
                    .number()
                    .int()
                    .optional()
                    .describe(
                        'Only include bookings with this id or lower. Use nästaMaxBokningsId from the previous ' +
                            'response to get the next page.',
                    ),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ query, status, bookingType, from, to, pageSize, maxBookingId }) => {
            const bookings = await (query?.trim() ? searchBookings(query, SEARCH_RESULT_LIMIT) : fetchBookings());

            const matchingBookings = filterBookings(bookings.map(toBooking).map(toBookingViewModel), {
                statuses: status?.map((name) => statusByName.get(name)!),
                bookingType: bookingType !== undefined ? bookingTypeByName.get(bookingType) : undefined,
                startDate: from ? new Date(from) : undefined,
                endDate: to ? new Date(to) : undefined,
            })
                .filter((booking) => maxBookingId === undefined || booking.id <= maxBookingId)
                .sort((a, b) => b.id - a.id);

            const page = matchingBookings.slice(0, pageSize);

            return toJsonResult(
                toMcpBookingSearchResult(
                    page,
                    matchingBookings.length > pageSize ? page[page.length - 1].id - 1 : null,
                ),
            );
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
                'VAT. Field names and values are in Swedish, matching the Backstage2 user interface.',
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
                        .then(toMcpCalendarEvent)
                        .catch(() => toMcpCalendarEvent({ id: calendarEventId, workingUsers: [] })),
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
                ),
            );
        },
    );

    return server;
};
