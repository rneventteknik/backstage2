import { RentalStatus } from '../models/enums/RentalStatus';
import { Status } from '../models/enums/Status';
import { Booking } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';
import { getEquipmentInDatetime, getEquipmentOutDatetime, toBookingViewModel } from './datetimeUtils';

interface bookingsWithPotentialProblemsResult {
    booking: Booking;
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

export const getBookingsWithPotentialProblems = (bookings: Booking[]): bookingsWithPotentialProblemsResult[] => {
    const bookingsToCheck = bookings
        .map(toBookingViewModel)
        .filter((x) => x.status != Status.CANCELED)
        .filter((x) => x.status != Status.DONE)
        .filter((x) => !x.internalReservation);

    return bookingsToCheck.map((booking) => {
        const now = new Date();

        const shouldBeBooked =
            booking.status === Status.DRAFT &&
            isMoreThanXHoursAfter(now, booking.equipmentOutDatetime, -hoursBeforeWarningBooked);
        const shouldBeDone =
            booking.status === Status.BOOKED &&
            isMoreThanXHoursAfter(now, booking.equipmentInDatetime, hoursBeforeWarningDone);

        const shouldBeOut =
            booking.equipmentLists
                ?.filter(
                    (x) =>
                        x.rentalStatus == null &&
                        isMoreThanXHoursAfter(now, getEquipmentOutDatetime(x), hoursBeforeWarningOut),
                ) ?? [];

        const shouldBeIn =
            booking.equipmentLists
                ?.filter(
                    (x) =>
                        x.rentalStatus != RentalStatus.RETURNED &&
                        isMoreThanXHoursAfter(now, getEquipmentInDatetime(x), hoursBeforeWarningIn),
                ) ?? [];
        return { booking, shouldBeOut, shouldBeIn, shouldBeBooked, shouldBeDone };
    });
};
