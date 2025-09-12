import { RentalStatus } from '../models/enums/RentalStatus';
import { Status } from '../models/enums/Status';
import { Booking } from '../models/interfaces';
import { EquipmentList } from '../models/interfaces/EquipmentList';
import { getEquipmentInDatetime, getEquipmentOutDatetime, toBookingViewModel } from './datetimeUtils';

interface bookingsWithPotentialProblemsResult {
    shouldBeOut: { equipmentList: EquipmentList; booking: Booking }[];
    shouldBeIn: { equipmentList: EquipmentList; booking: Booking }[];
    shouldBeBooked: Booking[];
    shouldBeDone: Booking[];
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

export const getBookingsWithPotentialProblems = (bookings: Booking[]): bookingsWithPotentialProblemsResult => {
    const bookingsToCheck = bookings
        .map(toBookingViewModel)
        .filter((x) => x.status != Status.CANCELED)
        .filter((x) => x.status != Status.DONE)
        .filter((x) => !x.internalReservation);
    const equipmentListsWithBookings = bookingsToCheck.flatMap(
        (booking) => booking.equipmentLists?.map((equipmentList) => ({ booking, equipmentList })) ?? [],
    );
    const now = new Date('2025-07-08'); // TODO: Use now

    const shouldBeBooked = bookingsToCheck.filter(
        (booking) =>
            booking.status === Status.DRAFT &&
            isMoreThanXHoursAfter(now, booking.equipmentOutDatetime, -hoursBeforeWarningBooked),
    );
    const shouldBeDone = bookingsToCheck.filter(
        (booking) =>
            booking.status === Status.BOOKED &&
            isMoreThanXHoursAfter(now, booking.equipmentInDatetime, hoursBeforeWarningDone),
    );

    const shouldBeOut = equipmentListsWithBookings.filter(
        (x) =>
            x.equipmentList.rentalStatus == null &&
            isMoreThanXHoursAfter(now, getEquipmentOutDatetime(x.equipmentList), hoursBeforeWarningOut),
    );
    const shouldBeIn = equipmentListsWithBookings.filter(
        (x) =>
            x.equipmentList.rentalStatus != RentalStatus.RETURNED &&
            isMoreThanXHoursAfter(now, getEquipmentInDatetime(x.equipmentList), hoursBeforeWarningIn),
    );

    return {
        shouldBeBooked: shouldBeBooked,
        shouldBeDone: shouldBeDone,
        shouldBeOut: shouldBeOut,
        shouldBeIn: shouldBeIn,
    };
};
