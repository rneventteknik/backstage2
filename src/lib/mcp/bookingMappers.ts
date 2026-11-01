import currency from 'currency.js';
import { AccountKind } from '../../models/enums/AccountKind';
import { BookingType } from '../../models/enums/BookingType';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { PricePlan } from '../../models/enums/PricePlan';
import { RentalStatus } from '../../models/enums/RentalStatus';
import { SalaryStatus } from '../../models/enums/SalaryStatus';
import { Status } from '../../models/enums/Status';
import { BookingViewModel, User } from '../../models/interfaces';
import { EquipmentList, EquipmentListEntry } from '../../models/interfaces/EquipmentList';
import {
    formatDatetimeForAnalyticsExport,
    getEquipmentInDatetime,
    getEquipmentOutDatetime,
    getNumberOfDays,
} from '../datetimeUtils';
import {
    computePriceSummary,
    getCalculatedDiscount,
    getCorrectPriceBasedOnBookingState,
    getEquipmentListPrice,
    getPrice,
    getPriceCalculationType,
    getTimeEstimatePrice,
    getTimeReportPrice,
} from '../pricingUtils';
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

// Users carry personal data (contact details, personal identity number, bank details), so only identifying fields
// are exposed.
const toMcpUser = (user: User | undefined) => (user ? { id: user.id, name: user.name, nameTag: user.nameTag } : null);

const sumHours = <T>(entries: T[] | undefined, getHours: (entry: T) => number): number =>
    entries?.reduce((sum, entry) => sum + getHours(entry), 0) ?? 0;

export const toMcpBookingSummary = (booking: BookingViewModel) => ({
    id: booking.id,
    name: booking.name,
    link: getLinkToBooking(booking.id),
    bookingType: BookingType[booking.bookingType],
    bookingTypeName: getBookingTypeName(booking.bookingType),
    status: Status[booking.status],
    statusName: getStatusName(booking.status),
    paymentStatus: PaymentStatus[booking.paymentStatus],
    paymentStatusName: getPaymentStatusName(booking.paymentStatus),
    internalReservation: Boolean(booking.internalReservation),
    ownerUser: booking.ownerUser ? { id: booking.ownerUser.id, name: booking.ownerUser.name } : null,
    customerName: booking.customerName,
    contactPersonName: booking.contactPersonName,
    location: booking.location,
    invoiceNumber: booking.invoiceNumber,
    usageStartDatetime: formatDatetimeForAnalyticsExport(booking.usageStartDatetime),
    usageEndDatetime: formatDatetimeForAnalyticsExport(booking.usageEndDatetime),
    equipmentOutDatetime: formatDatetimeForAnalyticsExport(booking.equipmentOutDatetime),
    equipmentInDatetime: formatDatetimeForAnalyticsExport(booking.equipmentInDatetime),
    created: formatDatetimeForAnalyticsExport(booking.created),
    updated: formatDatetimeForAnalyticsExport(booking.updated),
});

const toMcpEquipmentListEntry = (entry: EquipmentListEntry, list: EquipmentList, defaultAccount: string) => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    equipmentId: entry.equipmentId ?? null,
    equipmentName: entry.equipment?.name ?? null,
    equipmentPublicCategory: entry.equipment?.equipmentPublicCategory?.name ?? null,
    equipmentTags: entry.equipment?.tags?.map((tag) => tag.name) ?? [],
    numberOfUnits: entry.numberOfUnits,
    numberOfHours: entry.numberOfHours,
    pricePerUnit: entry.pricePerUnit.value,
    pricePerHour: entry.pricePerHour.value,
    equipmentPriceName: entry.equipmentPrice?.name ?? null,
    discountFixed: entry.discount.value,
    totalDiscount: getCalculatedDiscount(entry, getNumberOfDays(list), list.discountPercentage).value,
    totalPrice: getPrice(entry, getNumberOfDays(list), list.discountPercentage).value,
    account: entry.account ?? defaultAccount,
    isHidden: Boolean(entry.isHidden),
    isPacked: Boolean(entry.isPacked),
});

const toMcpEquipmentList = (list: EquipmentList, defaultAccount: string) => ({
    id: list.id,
    name: list.name,
    rentalStatus: list.rentalStatus != null ? RentalStatus[list.rentalStatus] : null,
    rentalStatusName: list.rentalStatus != null ? getRentalStatusName(list.rentalStatus) : null,
    usageStartDatetime: formatDatetimeForAnalyticsExport(list.usageStartDatetime),
    usageEndDatetime: formatDatetimeForAnalyticsExport(list.usageEndDatetime),
    equipmentOutDatetime: formatDatetimeForAnalyticsExport(getEquipmentOutDatetime(list)),
    equipmentInDatetime: formatDatetimeForAnalyticsExport(getEquipmentInDatetime(list)),
    numberOfDays: getNumberOfDays(list),
    discountPercentage: list.discountPercentage,
    totalPrice: getEquipmentListPrice(list).value,
    entries: list.listEntries.map((entry) => toMcpEquipmentListEntry(entry, list, defaultAccount)),
    headings: list.listHeadings.map((heading) => ({
        id: heading.id,
        name: heading.name,
        description: heading.description,
        entries: heading.listEntries.map((entry) => toMcpEquipmentListEntry(entry, list, defaultAccount)),
    })),
});

const toValueOrNull = (value: currency | null) => (value ? value.value : null);

export const toMcpBookingDetail = (booking: BookingViewModel, defaultAccounts: DefaultAccounts) => {
    const priceSummary = computePriceSummary(booking);
    const equipmentInDatetime = getEquipmentInDatetime(booking);
    const defaultEquipmentAccount =
        booking.accountKind === AccountKind.EXTERNAL
            ? defaultAccounts.equipmentExternal
            : defaultAccounts.equipmentInternal;

    return {
        ...toMcpBookingSummary(booking),
        coOwnerUsers: booking.coOwnerUsers?.map(toMcpUser) ?? [],
        ownerUser: toMcpUser(booking.ownerUser),
        salaryStatus: SalaryStatus[booking.salaryStatus],
        salaryStatusName: getSalaryStatusName(booking.salaryStatus),
        pricePlan: PricePlan[booking.pricePlan],
        pricePlanName: getPricePlanName(booking.pricePlan),
        accountKind: booking.accountKind != null ? AccountKind[booking.accountKind] : null,
        accountKindName: getAccountKindName(booking.accountKind),
        language: booking.language,
        languageName: getLanguageName(booking.language),
        note: booking.note,
        returnalNote: booking.returnalNote,
        contactPersonPhone: booking.contactPersonPhone,
        contactPersonEmail: booking.contactPersonEmail,
        invoiceAddress: booking.invoiceAddress,
        invoiceTag: booking.invoiceTag,
        invoiceHogiaId: booking.invoiceHogiaId,
        invoiceDate: formatDatetimeForAnalyticsExport(booking.invoiceDate),
        operationalYear: equipmentInDatetime ? getOperationalYear(equipmentInDatetime, true) : null,
        fiscalYear: booking.invoiceDate ? getOperationalYear(booking.invoiceDate, true) : null,

        pricing: {
            priceCalculationType: getPriceCalculationType(priceSummary),
            totalPriceExcludingVAT: getCorrectPriceBasedOnBookingState(priceSummary).value,
            fixedPrice: toValueOrNull(priceSummary.fixedPrice),
            equipmentPrice: priceSummary.equipmentPrice.value,
            timeEstimatePrice: priceSummary.timeEstimatePrice.value,
            timeReportsPrice: toValueOrNull(priceSummary.timeReportsPrice),
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
                pricePerHour: timeEstimate.pricePerHour.value,
                totalPrice: getTimeEstimatePrice(timeEstimate).value,
            })) ?? [],

        timeReports:
            booking.timeReports?.map((timeReport) => ({
                id: timeReport.id,
                name: timeReport.name,
                user: timeReport.user ? { id: timeReport.user.id, name: timeReport.user.name } : null,
                startDatetime: formatDatetimeForAnalyticsExport(timeReport.startDatetime),
                endDatetime: formatDatetimeForAnalyticsExport(timeReport.endDatetime),
                actualWorkingHours: timeReport.actualWorkingHours,
                billableWorkingHours: timeReport.billableWorkingHours,
                pricePerHour: timeReport.pricePerHour.value,
                totalPrice: getTimeReportPrice(timeReport).value,
            })) ?? [],

        changelog:
            booking.changelog?.map((entry) => ({
                description: entry.name,
                updated: formatDatetimeForAnalyticsExport(entry.updated),
            })) ?? [],

        calendarEventIds: booking.calendarEvents?.map((x) => x.calendarEventId) ?? [],
        emailThreadIds: booking.emailThreads?.map((x) => x.threadId) ?? [],
    };
};
