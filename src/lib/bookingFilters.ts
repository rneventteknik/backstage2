import { AccountKind } from '../models/enums/AccountKind';
import { BookingType } from '../models/enums/BookingType';
import { PricePlan } from '../models/enums/PricePlan';
import { RentalStatus } from '../models/enums/RentalStatus';
import { Status } from '../models/enums/Status';
import { BookingViewModel } from '../models/interfaces';
import { HasId } from '../models/interfaces/BaseEntity';
import { validDate } from './datetimeUtils';
import { listContainsEquipment } from './utils';

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

export interface BookingsByUsageTime {
    currentBookings: BookingViewModel[];
    futureBookings: BookingViewModel[];
    pastBookings: BookingViewModel[];
}

// Groups the bookings using a piece of equipment the same way as the equipment page. Bookings with a list containing
// the equipment that is still out count as current, even if the equipment should have been returned.
export const groupBookingsByEquipmentUsageTime = (
    bookings: BookingViewModel[],
    equipment: HasId,
    now = Date.now(),
): BookingsByUsageTime => {
    const bookingHasNonReturnedListWithEquipment = (booking: BookingViewModel) =>
        booking.equipmentLists?.some(
            (list) => list.rentalStatus === RentalStatus.OUT && listContainsEquipment(list, equipment),
        );

    const currentBookings = bookings.filter(
        (x) =>
            (x.equipmentOutDatetime &&
                x.equipmentInDatetime &&
                x.equipmentOutDatetime.getTime() < now &&
                x.equipmentInDatetime.getTime() > now) ||
            bookingHasNonReturnedListWithEquipment(x),
    );
    const futureBookings = bookings.filter(
        (x) =>
            x.equipmentOutDatetime &&
            x.equipmentInDatetime &&
            x.equipmentOutDatetime.getTime() > now &&
            x.equipmentInDatetime.getTime() > now &&
            !bookingHasNonReturnedListWithEquipment(x),
    );
    const pastBookings = bookings.filter(
        (x) =>
            x.equipmentOutDatetime &&
            x.equipmentInDatetime &&
            x.equipmentOutDatetime.getTime() < now &&
            x.equipmentInDatetime.getTime() < now &&
            !bookingHasNonReturnedListWithEquipment(x),
    );

    return { currentBookings, futureBookings, pastBookings };
};
