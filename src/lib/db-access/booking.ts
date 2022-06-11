import { AccountKind } from '../../models/enums/AccountKind';
import { BookingType } from '../../models/enums/BookingType';
import { PricePlan } from '../../models/enums/PricePlan';
import { Status } from '../../models/enums/Status';
import { BookingObjectionModel } from '../../models/objection-models';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { isMemberOfEnum } from '../utils';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchBookings = async (searchString: string, count: number): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return BookingObjectionModel.query()
        .where('name', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orWhere('contactPersonName', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orderBy('updated', 'desc')
        .limit(count);
};

export const fetchBookings = async (): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query().withGraphFetched('ownerUser');
};

export const fetchBookingsForUser = async (userId: number): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query().where('ownerUserId', userId);
};

export const fetchBooking = async (id: number): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('id', id)
        .then((bookings) => bookings[0]);
};

export const fetchBookingWithUser = async (id: number): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('id', id)
        .withGraphFetched('ownerUser')
        .withGraphFetched('equipmentLists.equipmentListEntries')
        .withGraphFetched('equipmentLists.equipmentListEntries.equipment.prices')
        .withGraphFetched('equipmentLists.equipmentListEntries.equipmentPrice')
        .withGraphFetched('timeEstimates')
        .withGraphFetched('timeReports')
        .withGraphFetched('changelog(changelogInfo)')
        .modifiers({
            changelogInfo: (builder) => {
                builder.orderBy('updated', 'desc').limit(50);
            },
        })
        .modifyGraph('equipmentLists', (builder) => {
            builder.orderBy('sortIndex');
        })
        .modifyGraph('equipmentLists.equipmentListEntries', (builder) => {
            builder.orderBy('sortIndex');
        })
        .then((bookings) => bookings[0]);
};

export const fetchBookingWithEquipmentLists = async (id: number): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('id', id)
        .withGraphFetched('ownerUser')
        .withGraphFetched('equipmentLists.equipmentListEntries.equipment.equipmentLocation')
        .withGraphFetched('timeEstimates')
        .withGraphFetched('changelog(changelogInfo)')
        .modifiers({
            changelogInfo: (builder) => {
                builder.orderBy('updated', 'desc').limit(50);
            },
        })
        .then((bookings) => bookings[0]);
};

export const fetchFirstBookingByCalendarBookingId = async (
    calendarBookingId: string,
): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('calendarBookingId', calendarBookingId)
        .then((bookings) => bookings[0]);
};

export const updateBooking = async (id: number, booking: BookingObjectionModel): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(booking)));
};

export const insertBooking = async (booking: BookingObjectionModel): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query().insert(withCreatedDate(removeIdAndDates(booking)));
};

export const deleteBooking = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateBookingObjectionModel = (booking: BookingObjectionModel): boolean => {
    if (!booking) return false;

    if (booking.bookingType !== undefined && !isMemberOfEnum(booking.bookingType, BookingType)) return false;
    if (booking.status !== undefined && !isMemberOfEnum(booking.status, Status)) return false;
    if (booking.pricePlan !== undefined && !isMemberOfEnum(booking.pricePlan, PricePlan)) return false;
    if (booking.accountKind !== undefined && !isMemberOfEnum(booking.accountKind, AccountKind)) return false;

    return true;
};

export const fetchBookingsWithEquipmentInInterval = async (
    equipmentId: number,
    startDatetime?: Date,
    endDatetime?: Date,
    ignoreEquipmentListId?: number,
): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    let query = BookingObjectionModel.query()
        .withGraphJoined('equipmentLists.equipmentListEntries')
        .where('equipmentLists:equipmentListEntries.equipmentId', equipmentId);

    if (endDatetime && startDatetime) {
        query = query
            .where('equipmentLists.equipmentOutDatetime', '<=', endDatetime.toISOString())
            .where('equipmentLists.equipmentInDatetime', '>=', startDatetime.toISOString());
    }

    if (ignoreEquipmentListId) {
        query = query.whereNot('equipmentLists.id', ignoreEquipmentListId);
    }

    return query.select();
};
