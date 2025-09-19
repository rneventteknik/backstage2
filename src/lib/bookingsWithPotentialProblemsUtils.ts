import { RentalStatus } from '../models/enums/RentalStatus';
import { Status } from '../models/enums/Status';
import { Booking, BookingViewModel } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';
import { getEquipmentInDatetime, getEquipmentOutDatetime, toBookingViewModel } from './datetimeUtils';

export interface BookingsWithPotentialProblemsResult {
    booking: BookingViewModel;
    shouldBeOut: EquipmentList[];
    shouldBeIn: EquipmentList[];
    shouldBeBooked: boolean;
    shouldBeDone: boolean;
}

const isMoreThanXHoursAfter = (
    dateA: Date | null | undefined,
    dateB: Date | null | undefined,
    hours: number,
): boolean => {
    if (!dateA || !dateB) {
        return false;
    }

    const diffHours = (dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60);
    return diffHours >= hours;
};

const hoursBeforeWarningIn = 24;
const hoursBeforeWarningOut = 24;
const hoursBeforeWarningBooked = 48;
const hoursBeforeWarningDone = 168;

export const getBookingsWithPotentialProblems = (bookings: Booking[]): BookingsWithPotentialProblemsResult[] => {
    const bookingsToCheck = bookings
        .map(toBookingViewModel)
        .filter((x) => x.status != Status.CANCELED)
        .filter((x) => x.status != Status.DONE)
        .filter((x) => !x.internalReservation);

    return bookingsToCheck
        .map((booking) => {
            const now = new Date('2025-07-10');

            const shouldBeBooked =
                booking.status === Status.DRAFT &&
                isMoreThanXHoursAfter(now, booking.equipmentOutDatetime, -hoursBeforeWarningBooked);
            const shouldBeDone =
                booking.status === Status.BOOKED &&
                isMoreThanXHoursAfter(now, booking.equipmentInDatetime, hoursBeforeWarningDone);

            const shouldBeOut =
                booking.equipmentLists?.filter(
                    (x) =>
                        x.rentalStatus == null &&
                        isMoreThanXHoursAfter(now, getEquipmentOutDatetime(x), hoursBeforeWarningOut),
                ) ?? [];

            const shouldBeIn =
                booking.equipmentLists?.filter(
                    (x) =>
                        x.rentalStatus != RentalStatus.RETURNED &&
                        isMoreThanXHoursAfter(now, getEquipmentInDatetime(x), hoursBeforeWarningIn),
                ) ?? [];
            return { booking, shouldBeOut, shouldBeIn, shouldBeBooked, shouldBeDone };
        })
        .filter((x) => x.shouldBeOut.length > 0 || x.shouldBeIn.length > 0 || x.shouldBeBooked || x.shouldBeDone);
};
