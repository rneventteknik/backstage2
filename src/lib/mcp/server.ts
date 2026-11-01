import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { BookingType } from '../../models/enums/BookingType';
import { Status } from '../../models/enums/Status';
import { toBookingViewModel } from '../datetimeUtils';
import { filterBookings } from '../bookingFilters';
import { fetchBookings, searchBookings } from '../db-access';
import { fetchBookingForMcp } from '../db-access/booking';
import { fetchSettings } from '../db-access/setting';
import { toBooking } from '../mappers/booking';
import { getGlobalSetting } from '../utils';
import { toMcpBookingDetail, toMcpBookingSummary } from './bookingMappers';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
// searchBookings returns the most recently updated matches first, so this bounds how far back a free-text search reaches.
const SEARCH_RESULT_LIMIT = 1000;

const statusKeys = ['DRAFT', 'BOOKED', 'DONE', 'CANCELED'] as const satisfies (keyof typeof Status)[];
const bookingTypeKeys = ['RENTAL', 'GIG'] as const satisfies (keyof typeof BookingType)[];

const toJsonResult = <T extends Record<string, unknown>>(result: T) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(result) }],
    structuredContent: result,
});

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
                'matching bookings. Use get_booking for full details on a booking.',
            inputSchema: z.object({
                query: z.string().optional().describe('Free-text search string'),
                status: z.array(z.enum(statusKeys)).optional().describe('Only include bookings with these statuses'),
                bookingType: z.enum(bookingTypeKeys).optional(),
                from: z.iso.date().optional().describe('Only include bookings whose usage starts after this date'),
                to: z.iso.date().optional().describe('Only include bookings whose usage ends before this date'),
                pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
                maxBookingId: z
                    .number()
                    .int()
                    .optional()
                    .describe(
                        'Only include bookings with this id or lower. Use nextMaxBookingId to get the next page.',
                    ),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ query, status, bookingType, from, to, pageSize, maxBookingId }) => {
            const bookings = await (query?.trim() ? searchBookings(query, SEARCH_RESULT_LIMIT) : fetchBookings());

            const matchingBookings = filterBookings(bookings.map(toBooking).map(toBookingViewModel), {
                statuses: status?.map((x) => Status[x]),
                bookingType: bookingType !== undefined ? BookingType[bookingType] : undefined,
                startDate: from ? new Date(from) : undefined,
                endDate: to ? new Date(to) : undefined,
            })
                .filter((booking) => maxBookingId === undefined || booking.id <= maxBookingId)
                .sort((a, b) => b.id - a.id);

            const page = matchingBookings.slice(0, pageSize);

            return toJsonResult({
                bookings: page.map(toMcpBookingSummary),
                nextMaxBookingId: matchingBookings.length > pageSize ? page[page.length - 1].id - 1 : null,
            });
        },
    );

    server.registerTool(
        'get_booking',
        {
            title: 'Get booking',
            description:
                'Get all details about a booking: people, customer and invoice information, notes, pricing, ' +
                'equipment lists with prices, time estimates, time reports and the latest changelog entries. ' +
                'Prices are in SEK excluding VAT.',
            inputSchema: z.object({
                bookingId: z.number().int(),
            }),
            annotations: { readOnlyHint: true },
        },
        async ({ bookingId }) => {
            const [booking, globalSettings] = await Promise.all([fetchBookingForMcp(bookingId), fetchSettings()]);

            if (!booking) {
                return toErrorResult(`Booking ${bookingId} not found`);
            }

            return toJsonResult(
                toMcpBookingDetail(toBookingViewModel(toBooking(booking)), {
                    equipmentExternal: getGlobalSetting('accounts.defaultEquipmentAccount.external', globalSettings),
                    equipmentInternal: getGlobalSetting('accounts.defaultEquipmentAccount.internal', globalSettings),
                }),
            );
        },
    );

    return server;
};
