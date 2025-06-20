import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithCustomErrorMessage, respondWithInvalidMethodResponse } from '../../../../../lib/apiResponses';
import { fetchBookings } from '../../../../../lib/db-access';
import { withApiKeyContext } from '../../../../../lib/sessionContext';
import {
    getEquipmentListPrice,
    getTotalTimeEstimatesPrice,
    getTotalTimeReportsPrice,
} from '../../../../../lib/pricingUtils';
import { BookingViewModel } from '../../../../../models/interfaces';
import { toBooking } from '../../../../../lib/mappers/booking';
import currency from 'currency.js';
import {
    formatDatetimeForAnalyticsExport,
    getEquipmentInDatetime,
    toBookingViewModel,
} from '../../../../../lib/datetimeUtils';
import {
    getAccountKindName,
    getBookingTypeName,
    getOperationalYear,
    getPaymentStatusName,
    getPricePlanName,
    getSalaryStatusName,
    getStatusName,
    IsNotInternalReservation,
} from '../../../../../lib/utils';

const handler = withApiKeyContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await fetchBookings()
                .then((x) => x.map(toBooking))
                .then((x) => x.map(toBookingViewModel))
                .then((x) => x.filter(IsNotInternalReservation))
                .then((x) => mapToAnalytics(x))
                .then((x) => mapToCSV(x))
                .then((result) => res.status(200).setHeader('Content-Type', 'text/csv').send(result))
                .catch((error) => respondWithCustomErrorMessage(res, error.message));
            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

interface BookingAnalyticsModel {
    id: number;
    name: string;
    created: string | null;
    ownerUserName?: string;
    ownerUserId?: number;
    bookingType: string;
    status: string;
    paymentStatus: string;
    invoiceHogiaId: number | null;
    salaryStatus: string;
    pricePlan: string;
    accountKind: string | null;
    location: string;
    language: string;
    fixedPrice?: number | null;
    totalTimeEstimatesPrice: number;
    totalTimeReportsPrice: number;
    totalEquipmentPrice: number;
    usageStartDatetime: string | null;
    usageEndDatetime: string | null;
    equipmentOutDatetime: string | null;
    equipmentInDatetime: string | null;
    invoiceDate: string | null;
    estimatedHours: number;
    actualWorkingHours: number;
    billableWorkingHours: number;
    operationalYear: string | null;
    fiscalYear: string | null;
}

const mapToAnalytics = (bookings: BookingViewModel[]): BookingAnalyticsModel[] =>
    bookings.map((booking) => ({
        id: booking.id,
        name: booking.name,
        created: formatDatetimeForAnalyticsExport(booking.created),
        ownerUserName: booking.ownerUser?.name,
        ownerUserId: booking.ownerUserId,
        bookingType: getBookingTypeName(booking.bookingType),
        status: getStatusName(booking.status),
        salaryStatus: getSalaryStatusName(booking.salaryStatus),
        paymentStatus: getPaymentStatusName(booking.paymentStatus),
        invoiceHogiaId: booking.invoiceHogiaId,
        pricePlan: getPricePlanName(booking.pricePlan),
        accountKind: getAccountKindName(booking.accountKind),
        location: booking.location,
        language: booking.language,

        // Pricing
        fixedPrice: booking.fixedPrice,
        totalTimeEstimatesPrice: getTotalTimeEstimatesPrice(booking.timeEstimates).value,
        totalTimeReportsPrice: getTotalTimeReportsPrice(booking.timeReports).value,
        totalEquipmentPrice:
            booking.equipmentLists?.reduce((sum, l) => sum.add(getEquipmentListPrice(l)), currency(0)).value ?? 0,

        // Dates
        usageStartDatetime: formatDatetimeForAnalyticsExport(booking.usageStartDatetime),
        usageEndDatetime: formatDatetimeForAnalyticsExport(booking.usageEndDatetime),
        equipmentOutDatetime: formatDatetimeForAnalyticsExport(booking.equipmentOutDatetime),
        equipmentInDatetime: formatDatetimeForAnalyticsExport(booking.equipmentInDatetime),
        invoiceDate: booking.invoiceDate ? formatDatetimeForAnalyticsExport(booking.invoiceDate) : null,
        operationalYear: getEquipmentInDatetime(booking)
            ? getOperationalYear(getEquipmentInDatetime(booking), true)
            : null,
        fiscalYear: booking.invoiceDate ? getOperationalYear(booking.invoiceDate, true) : null,

        // Working hours
        estimatedHours: booking.timeEstimates?.reduce((sum, entry) => sum + entry.numberOfHours, 0) ?? 0,
        actualWorkingHours: booking.timeReports?.reduce((sum, entry) => sum + entry.actualWorkingHours, 0) ?? 0,
        billableWorkingHours: booking.timeReports?.reduce((sum, entry) => sum + entry.billableWorkingHours, 0) ?? 0,
    }));

const mapToCSV = (bookings: BookingAnalyticsModel[]) => {
    const headings = Object.keys(bookings[0]);
    const headerRow = headings.join(',');

    const bookingRows = bookings.map((booking) =>
        headings
            .map((fieldName) => JSON.stringify((booking as unknown as { [name: string]: string })[fieldName]))
            .map((value) => value.replace('\\"', '”'))
            .map((value) => (value == 'null' ? '' : value))
            .join(','),
    );

    return [headerRow, ...bookingRows].join('\r\n');
};

export default handler;
