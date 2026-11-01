import currency from 'currency.js';
import { AccountKind } from '../../models/enums/AccountKind';
import { BookingViewModel, User } from '../../models/interfaces';
import { BookingChangelogEntry } from '../../models/interfaces/ChangeLogEntry';
import { EquipmentList, EquipmentListEntry, EquipmentListHeading } from '../../models/interfaces/EquipmentList';
import { CalendarResult } from '../../models/misc/CalendarResult';
import {
    formatDatetimeForAnalyticsExport,
    getEquipmentInDatetime,
    getEquipmentOutDatetime,
    getNumberOfDays,
} from '../datetimeUtils';
import {
    addVAT,
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
} from '../pricingUtils';
import { getSortedList } from '../sortUtils';
import {
    getAccountKindName,
    getBookingTypeName,
    getLanguageName,
    getOperationalYear,
    getPaymentStatusName,
    getPricePlanName,
    getRentalStatusName,
    getSalaryStatusName,
    getStatusName,
} from '../utils';

export interface DefaultAccounts {
    equipmentExternal: string;
    equipmentInternal: string;
}

const getLinkToBooking = (bookingId: number): string => process.env.APPLICATION_BASE_URL + '/bookings/' + bookingId;

const getFirstName = (name: string): string => name.trim().split(/\s+/)[0];

// Personal data (full names and customer contact details) is only exposed to API keys with this scope.
export const PII_SCOPE = 'pii';

// Users carry personal data (contact details, personal identity number, bank details), so only identifying fields
// are exposed.
const toMcpUser = (user: Pick<User, 'id' | 'name' | 'nameTag'> | undefined, canSeePii: boolean) =>
    user ? { id: user.id, name: canSeePii ? user.name : getFirstName(user.name), nameTag: user.nameTag } : null;

// Without the pii scope only the Hogia ID is exposed, plus the customer name when the customer is registered in Hogia.
const toMcpCustomerSummary = (booking: BookingViewModel, canSeePii: boolean) =>
    canSeePii
        ? {
              customerName: booking.customerName,
              contactPersonName: booking.contactPersonName,
              invoiceHogiaId: booking.invoiceHogiaId,
          }
        : {
              ...(booking.invoiceHogiaId != null ? { customerName: booking.customerName } : {}),
              invoiceHogiaId: booking.invoiceHogiaId,
          };

const toMcpCustomerContactDetails = (booking: BookingViewModel, canSeePii: boolean) =>
    canSeePii
        ? {
              contactPersonPhone: booking.contactPersonPhone,
              contactPersonEmail: booking.contactPersonEmail,
              invoiceAddress: booking.invoiceAddress,
              invoiceTag: booking.invoiceTag,
          }
        : {};

const toMcpPrice = (price: currency) => ({
    excludingVAT: price.value,
    includingVAT: addVAT(price).value,
});

const toMcpPriceOrNull = (price: currency | null) => (price ? toMcpPrice(price) : null);

const sumHours = <T>(entries: T[] | undefined, getHours: (entry: T) => number): number =>
    entries?.reduce((sum, entry) => sum + getHours(entry), 0) ?? 0;

export const toMcpBookingSummary = (booking: BookingViewModel, canSeePii: boolean) => ({
    id: booking.id,
    name: booking.name,
    link: getLinkToBooking(booking.id),
    bookingType: getBookingTypeName(booking.bookingType),
    status: getStatusName(booking.status),
    paymentStatus: getPaymentStatusName(booking.paymentStatus),
    internalReservation: Boolean(booking.internalReservation),
    ownerUser: toMcpUser(booking.ownerUser, canSeePii),
    ...toMcpCustomerSummary(booking, canSeePii),
    location: booking.location,
    invoiceNumber: booking.invoiceNumber,
    usageStartDatetime: formatDatetimeForAnalyticsExport(booking.usageStartDatetime),
    usageEndDatetime: formatDatetimeForAnalyticsExport(booking.usageEndDatetime),
    equipmentOutDatetime: formatDatetimeForAnalyticsExport(booking.equipmentOutDatetime),
    equipmentInDatetime: formatDatetimeForAnalyticsExport(booking.equipmentInDatetime),
    created: formatDatetimeForAnalyticsExport(booking.created),
});

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

        changelog: booking.changelog?.map(toMcpChangelogEntry) ?? [],

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
