import { AccountKind } from '../../../models/enums/AccountKind';
import { BookingViewModel } from '../../../models/interfaces';
import { BookingChangelogEntry } from '../../../models/interfaces/ChangeLogEntry';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../../../models/interfaces/EquipmentList';
import { CalendarResult } from '../../../models/misc/CalendarResult';
import {
    formatDatetimeForAnalyticsExport,
    getEquipmentInDatetime,
    getEquipmentOutDatetime,
    getNumberOfDays,
} from '../../datetimeUtils';
import {
    changelogEntryHasPriceInformation,
    computePriceSummary,
    getCalculatedDiscount,
    getCorrectPriceBasedOnBookingState,
    getEquipmentListHeadingPrice,
    getEquipmentListPrice,
    getPrice,
    getPriceCalculationTypeLabel,
    getPriceSummaryFromChangelogEntry,
    getTimeEstimatePrice,
    getTimeReportPrice,
} from '../../pricingUtils';
import { getSortedList } from '../../sortUtils';
import { toMcpBookingSummary } from './bookingSummary';
import { getFirstName, toMcpCustomerContactDetails, toMcpPrice, toMcpPriceOrNull, toMcpUser } from './primitives';
import {
    getAccountKindName,
    getLanguageName,
    getOperationalYear,
    getPricePlanName,
    getRentalStatusName,
    getSalaryStatusName,
} from '../../utils';

export interface DefaultAccounts {
    equipmentExternal: string;
    equipmentInternal: string;
}

const sumHours = <T>(entries: T[] | undefined, getHours: (entry: T) => number): number =>
    entries?.reduce((sum, entry) => sum + getHours(entry), 0) ?? 0;

const toMcpEquipmentListEntry = (entry: EquipmentListEntry, list: EquipmentList, defaultAccount: string) => ({
    type: 'rad' as const,
    id: entry.id,
    name: entry.name,
    description: entry.description,
    equipmentId: entry.equipmentId ?? null,
    equipmentName: entry.equipment?.name ?? null,
    equipmentPublicCategory: entry.equipment?.equipmentPublicCategory?.name ?? null,
    equipmentTags: entry.equipment?.tags?.map((tag) => tag.name) ?? [],
    numberOfUnits: entry.numberOfUnits,
    numberOfHours: entry.numberOfHours,
    pricePerUnit: toMcpPrice(entry.pricePerUnit),
    pricePerHour: toMcpPrice(entry.pricePerHour),
    equipmentPriceName: entry.equipmentPrice?.name ?? null,
    discountFixed: toMcpPrice(entry.discount),
    totalDiscount: toMcpPrice(getCalculatedDiscount(entry, getNumberOfDays(list), list.discountPercentage)),
    totalPrice: toMcpPrice(getPrice(entry, getNumberOfDays(list), list.discountPercentage)),
    account: entry.account ?? defaultAccount,
    isHidden: Boolean(entry.isHidden),
    isPacked: Boolean(entry.isPacked),
});

const toMcpEquipmentListHeading = (heading: EquipmentListHeading, list: EquipmentList, defaultAccount: string) => ({
    type: 'rubrikrad' as const,
    id: heading.id,
    name: heading.name,
    description: heading.description,
    totalPrice: toMcpPrice(getEquipmentListHeadingPrice(heading, getNumberOfDays(list), list.discountPercentage)),
    entries: getSortedList(heading.listEntries).map((entry) => toMcpEquipmentListEntry(entry, list, defaultAccount)),
});

// Entries and headings are shown as a single list ordered by sortIndex in Backstage2, with the entries belonging to a
// heading listed under it.
const toMcpEquipmentListRows = (list: EquipmentList, defaultAccount: string) =>
    getSortedList([
        ...list.listEntries.map((entry) => ({ id: 'E' + entry.id, sortIndex: entry.sortIndex, entry })),
        ...list.listHeadings.map((heading) => ({ id: 'H' + heading.id, sortIndex: heading.sortIndex, heading })),
    ]).map((row) =>
        'heading' in row
            ? toMcpEquipmentListHeading(row.heading, list, defaultAccount)
            : toMcpEquipmentListEntry(row.entry, list, defaultAccount),
    );

const toMcpEquipmentList = (list: EquipmentList, defaultAccount: string) => ({
    id: list.id,
    name: list.name,
    rentalStatus: list.rentalStatus != null ? getRentalStatusName(list.rentalStatus) : null,
    usageStartDatetime: formatDatetimeForAnalyticsExport(list.usageStartDatetime),
    usageEndDatetime: formatDatetimeForAnalyticsExport(list.usageEndDatetime),
    equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(list)),
    equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(list)),
    numberOfDays: getNumberOfDays(list),
    discountPercentage: list.discountPercentage,
    totalPrice: toMcpPrice(getEquipmentListPrice(list)),
    rows: toMcpEquipmentListRows(list, defaultAccount),
});

const toMcpChangelogEntry = (entry: BookingChangelogEntry) => {
    const priceSummary = changelogEntryHasPriceInformation(entry) ? getPriceSummaryFromChangelogEntry(entry) : null;

    return {
        description: entry.name,
        updated: formatDatetimeForAnalyticsExport(entry.updated),
        totalPrice: priceSummary ? toMcpPrice(getCorrectPriceBasedOnBookingState(priceSummary)) : null,
        priceCalculationType: priceSummary ? getPriceCalculationTypeLabel(priceSummary) : null,
    };
};

export const toMcpCalendarEvent = (event: CalendarResult, canSeePii: boolean) => ({
    id: event.id,
    name: event.name ?? null,
    start: event.start ?? null,
    end: event.end ?? null,
    link: event.link ?? null,
    workingUsers: event.workingUsers.map((user) => ({
        id: user.id ?? null,
        name: user.name ? (canSeePii ? user.name : getFirstName(user.name)) : null,
        nameTag: user.nameTag ?? null,
    })),
});

export const toMcpBookingDetail = (
    booking: BookingViewModel,
    defaultAccounts: DefaultAccounts,
    calendarEvents: ReturnType<typeof toMcpCalendarEvent>[],
    canSeePii: boolean,
) => {
    const priceSummary = computePriceSummary(booking);
    const equipmentInDatetime = getEquipmentInDatetime(booking);
    const defaultEquipmentAccount =
        booking.accountKind === AccountKind.EXTERNAL
            ? defaultAccounts.equipmentExternal
            : defaultAccounts.equipmentInternal;

    return {
        ...toMcpBookingSummary(booking, canSeePii),
        salaryStatus: getSalaryStatusName(booking.salaryStatus),
        pricePlan: getPricePlanName(booking.pricePlan),
        accountKind: getAccountKindName(booking.accountKind),
        language: getLanguageName(booking.language),
        note: booking.note,
        returnalNote: booking.returnalNote,
        ...toMcpCustomerContactDetails(booking, canSeePii),
        invoiceDate: formatDatetimeForAnalyticsExport(booking.invoiceDate),
        operationalYear: equipmentInDatetime ? getOperationalYear(equipmentInDatetime, true) : null,

        pricing: {
            priceCalculationType: getPriceCalculationTypeLabel(priceSummary),
            totalPrice: toMcpPrice(getCorrectPriceBasedOnBookingState(priceSummary)),
            fixedPrice: toMcpPriceOrNull(priceSummary.fixedPrice),
            equipmentPrice: toMcpPrice(priceSummary.equipmentPrice),
            timeEstimatePrice: toMcpPrice(priceSummary.timeEstimatePrice),
            timeReportsPrice: toMcpPriceOrNull(priceSummary.timeReportsPrice),
        },

        hours: {
            estimatedHours: sumHours(booking.timeEstimates, (x) => x.numberOfHours),
            actualWorkingHours: sumHours(booking.timeReports, (x) => x.actualWorkingHours),
            billableWorkingHours: sumHours(booking.timeReports, (x) => x.billableWorkingHours),
        },

        equipmentLists: booking.equipmentLists?.map((list) => toMcpEquipmentList(list, defaultEquipmentAccount)) ?? [],

        timeEstimates:
            booking.timeEstimates?.map((timeEstimate) => ({
                id: timeEstimate.id,
                name: timeEstimate.name,
                numberOfHours: timeEstimate.numberOfHours,
                pricePerHour: toMcpPrice(timeEstimate.pricePerHour),
                totalPrice: toMcpPrice(getTimeEstimatePrice(timeEstimate)),
            })) ?? [],

        timeReports:
            booking.timeReports?.map((timeReport) => ({
                id: timeReport.id,
                name: timeReport.name,
                user: toMcpUser(timeReport.user, canSeePii),
                startDatetime: formatDatetimeForAnalyticsExport(timeReport.startDatetime),
                endDatetime: formatDatetimeForAnalyticsExport(timeReport.endDatetime),
                actualWorkingHours: timeReport.actualWorkingHours,
                billableWorkingHours: timeReport.billableWorkingHours,
                pricePerHour: toMcpPrice(timeReport.pricePerHour),
                totalPrice: toMcpPrice(getTimeReportPrice(timeReport)),
            })) ?? [],

        // Changelog descriptions are free text starting with the full names of the people involved.
        ...(canSeePii ? { changelog: booking.changelog?.map(toMcpChangelogEntry) ?? [] } : {}),

        calendarEvents,
    };
};

export const toMcpBookingSearchResult = (
    bookings: BookingViewModel[],
    nextMaxBookingId: number | null,
    canSeePii: boolean,
) => ({
    bookings: bookings.map((booking) => toMcpBookingSummary(booking, canSeePii)),
    nextMaxBookingId,
});
