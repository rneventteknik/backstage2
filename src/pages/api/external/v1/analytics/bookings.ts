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
import { formatDatetimeForForm, toBookingViewModel } from '../../../../../lib/datetimeUtils';

const handler = withApiKeyContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            await fetchBookings()
                .then((x) => x.map(toBooking))
                .then((x) => x.map(toBookingViewModel))
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
    created?: string;
    ownerUserName?: string;
    ownerUserId?: number;
    bookingType: number;
    status: number;
    paymentStatus: number;
    invoiceHogiaId: number | null;
    salaryStatus: number;
    pricePlan: number;
    accountKind: number | null;
    location: string;
    customerName: string;
    language: string;
    fixedPrice?: number | null;
    totalTimeEstimatesPrice: number;
    totalTimeReportsPrice: number;
    totalEquipmentPrice: number;
    usageStartDatetime: string | undefined;
    usageEndDatetime: string | undefined;
    equipmentOutDatetime: string | undefined;
    equipmentInDatetime: string | undefined;
    estimatedHours: number;
    actualWorkingHours: number;
    billableWorkingHours: number;
}

const mapToAnalytics = (bookings: BookingViewModel[]): BookingAnalyticsModel[] =>
    bookings.map((booking) => ({
        id: booking.id,
        name: booking.name,
        created: formatDatetimeForForm(booking.created),
        ownerUserName: booking.ownerUser?.name,
        ownerUserId: booking.ownerUserId,
        bookingType: booking.bookingType,
        status: booking.status,
        salaryStatus: booking.salaryStatus,
        paymentStatus: booking.paymentStatus,
        invoiceHogiaId: booking.invoiceHogiaId,
        pricePlan: booking.pricePlan,
        accountKind: booking.accountKind,
        location: booking.location,
        customerName: booking.customerName,
        language: booking.language,

        // Pricing
        fixedPrice: booking.fixedPrice,
        totalTimeEstimatesPrice: getTotalTimeEstimatesPrice(booking.timeEstimates).value,
        totalTimeReportsPrice: getTotalTimeReportsPrice(booking.timeReports).value,
        totalEquipmentPrice:
            booking.equipmentLists?.reduce((sum, l) => sum.add(getEquipmentListPrice(l)), currency(0)).value ?? 0,

        // Dates
        usageStartDatetime: formatDatetimeForForm(booking.usageStartDatetime),
        usageEndDatetime: formatDatetimeForForm(booking.usageEndDatetime),
        equipmentOutDatetime: formatDatetimeForForm(booking.equipmentOutDatetime),
        equipmentInDatetime: formatDatetimeForForm(booking.equipmentInDatetime),

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
            .join(','),
    );

    return [headerRow, ...bookingRows].join('\r\n');
};

export default handler;
