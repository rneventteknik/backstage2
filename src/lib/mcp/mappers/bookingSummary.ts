import { BookingViewModel } from '../../../models/interfaces';
import { formatDatetimeForAnalyticsExport } from '../../datetimeUtils';
import { getBookingTypeName, getPaymentStatusName, getStatusName } from '../../utils';
import { getLinkToBooking, toMcpCustomerSummary, toMcpUser } from './primitives';

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
