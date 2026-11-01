import { AccountKind } from '../models/enums/AccountKind';
import { BookingType } from '../models/enums/BookingType';
import { PricePlan } from '../models/enums/PricePlan';
import { Status } from '../models/enums/Status';
import { BookingViewModel } from '../models/interfaces';
import { validDate } from './datetimeUtils';

export interface BookingFilter {
    userIds?: number[];
    statuses?: Status[];
    startDate?: Date | null;
    endDate?: Date | null;
    customerName?: string;
    location?: string;
    bookingType?: BookingType;
    pricePlan?: PricePlan;
    accountKind?: AccountKind;
}

// Empty or undefined filter values do not filter anything. The date filters keep bookings whose usage period lies
// within the given dates.
export const filterBookings = (bookings: BookingViewModel[], filter: BookingFilter): BookingViewModel[] => {
    const { userIds, statuses, startDate, endDate, customerName, location, bookingType, pricePlan, accountKind } =
        filter;

    return bookings
        .filter(
            (booking) =>
                !userIds ||
                userIds.length === 0 ||
                (booking.ownerUser?.id && userIds.indexOf(booking.ownerUser?.id) >= 0),
        )
        .filter((booking) => !statuses || statuses.length === 0 || statuses.indexOf(booking.status) >= 0)
        .filter(
            (booking) =>
                !startDate ||
                !validDate(startDate) ||
                (booking.usageStartDatetime && booking.usageStartDatetime > startDate),
        )
        .filter(
            (booking) =>
                !endDate || !validDate(endDate) || (booking.usageEndDatetime && booking.usageEndDatetime < endDate),
        )
        .filter((booking) => !customerName || booking.customerName?.toLowerCase().includes(customerName.toLowerCase()))
        .filter((booking) => !location || booking.location?.toLowerCase().includes(location.toLowerCase()))
        .filter((booking) => bookingType == undefined || booking.bookingType === bookingType)
        .filter((booking) => pricePlan == undefined || booking.pricePlan === pricePlan)
        .filter((booking) => accountKind == undefined || booking.accountKind === accountKind);
};
