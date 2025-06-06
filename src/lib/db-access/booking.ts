import { AccountKind } from '../../models/enums/AccountKind';
import { BookingType } from '../../models/enums/BookingType';
import { PaymentStatus } from '../../models/enums/PaymentStatus';
import { PricePlan } from '../../models/enums/PricePlan';
import { Status } from '../../models/enums/Status';
import { BookingObjectionModel } from '../../models/objection-models';
import { EquipmentListObjectionModel } from '../../models/objection-models/BookingObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { getPartialSearchStrings, isMemberOfEnum } from '../utils';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchBookings = async (searchString: string, count: number): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const searchStrings = getPartialSearchStrings(searchString);

    return BookingObjectionModel.query()
        .where((builder) => {
            searchStrings.forEach((partialSearchString) => {
                builder.andWhere('name', getCaseInsensitiveComparisonKeyword(), partialSearchString);
            });
        })
        .orWhere((builder) => {
            searchStrings.forEach((partialSearchString) => {
                builder.andWhere('contactPersonName', getCaseInsensitiveComparisonKeyword(), partialSearchString);
            });
        })
        .withGraphFetched('equipmentLists')
        .orWhere((builder) => {
            searchStrings.forEach((partialSearchString) => {
                builder.andWhere('invoiceNumber', getCaseInsensitiveComparisonKeyword(), partialSearchString);
            });
        })
        .orWhere((builder) => {
            searchStrings.forEach((partialSearchString) => {
                builder.andWhere('customerName', getCaseInsensitiveComparisonKeyword(), partialSearchString);
            });
        })
        .orderBy('updated', 'desc')
        .limit(count);
};

export const fetchBookings = async (): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .withGraphFetched('ownerUser')
        .withGraphFetched('timeEstimates')
        .withGraphFetched('timeReports.user')
        .withGraphFetched('equipmentLists.listEntries.equipment')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipment');
};

export const fetchBookingsForAnalytics = async (): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .withGraphFetched('ownerUser')
        .withGraphFetched('timeEstimates')
        .withGraphFetched('timeReports.user')
        .withGraphFetched('equipmentLists.listEntries.equipment')
        .withGraphFetched('equipmentLists.listEntries.equipment.equipmentPublicCategory')
        .withGraphFetched('equipmentLists.listEntries.equipment.tags')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipment')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipment.equipmentPublicCategory')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipment.tags')
        .withGraphFetched('equipmentLists.listEntries.equipmentPrice')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipmentPrice');
};

export const fetchBookingsForUser = async (userId: number): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('ownerUserId', userId)
        .withGraphFetched('equipmentLists')
        .withGraphFetched('changelog(changelogInfo)')
        .modifiers({
            changelogInfo: (builder) => {
                builder.orderBy('updated', 'desc').limit(25);
            },
        });
};

export const fetchBookingsForCoOwnerUser = async (userId: number): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .withGraphFetched('equipmentLists')
        .joinRelated('coOwnerUsers')
        .where('coOwnerUsers.id', userId)
        .withGraphFetched('changelog(changelogInfo)')
        .modifiers({
            changelogInfo: (builder) => {
                builder.orderBy('updated', 'desc').limit(25);
            },
        });
};

export const fetchBookingsForTimeReportUser = async (userId: number): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .withGraphFetched('equipmentLists')
        .withGraphFetched('timeReports.user')
        .whereIn(
            'id',
            BookingObjectionModel.query()
                .joinRelated('timeReports')
                .where('timeReports.userId', userId)
                .select('Booking.id'),
        );
};

export const fetchBookingsForEquipment = async (equipmentId: number): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .whereIn(
            'id',
            BookingObjectionModel.query()
                .joinRelated('equipmentLists.listEntries')
                .where('equipmentLists:listEntries.equipmentId', equipmentId)
                .select('Booking.id'),
        )
        .orWhereIn(
            'id',
            BookingObjectionModel.query()
                .joinRelated('equipmentLists.listHeadings.listEntries')
                .where('equipmentLists:listHeadings:listEntries.equipmentId', equipmentId)
                .select('Booking.id'),
        )
        .withGraphFetched('equipmentLists')
        .withGraphFetched('equipmentLists.listEntries')
        .withGraphFetched('equipmentLists.listEntries.equipment')
        .withGraphFetched('equipmentLists.listHeadings.listEntries')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipment');
};

export const fetchBookingsReadyForCashPayment = async (): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('Booking.paymentStatus', PaymentStatus.READY_FOR_CASH_PAYMENT)
        .withGraphFetched('equipmentLists.listEntries')
        .withGraphFetched('equipmentLists.listHeadings.listEntries')
        .withGraphFetched('timeReports');
};

export const fetchBookingsPaidWithCash = async (): Promise<BookingObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('Booking.paymentStatus', PaymentStatus.PAID_WITH_CASH)
        .withGraphFetched('equipmentLists.listEntries')
        .withGraphFetched('equipmentLists.listHeadings.listEntries')
        .withGraphFetched('timeReports');
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
        .withGraphFetched('coOwnerUsers')
        .withGraphFetched('equipmentLists.listEntries')
        .withGraphFetched('equipmentLists.listEntries.equipment.prices')
        .withGraphFetched('equipmentLists.listEntries.equipmentPrice')
        .withGraphFetched('equipmentLists.listHeadings.listEntries')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipment.prices')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipmentPrice')
        .withGraphFetched('timeEstimates')
        .withGraphFetched('timeReports.user')
        .withGraphFetched('changelog(changelogInfo)')
        .modifiers({
            changelogInfo: (builder) => {
                builder.orderBy('updated', 'desc').limit(250);
            },
        })
        .modifyGraph('equipmentLists', (builder) => {
            builder.orderBy('sortIndex');
        })
        .modifyGraph('equipmentLists.listEntries', (builder) => {
            builder.orderBy('sortIndex');
        })
        .then((bookings) => bookings[0]);
};

export const fetchBookingWithEquipmentLists = async (id: number): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.query()
        .where('id', id)
        .withGraphFetched('ownerUser')
        .withGraphFetched('coOwnerUsers')
        .withGraphFetched('equipmentLists.listEntries.equipment.equipmentLocation')
        .withGraphFetched('equipmentLists.listHeadings.listEntries.equipment.equipmentLocation')
        .withGraphFetched('timeEstimates')
        .withGraphFetched('changelog(changelogInfo)')
        .modifiers({
            changelogInfo: (builder) => {
                builder.orderBy('updated', 'desc').limit(250);
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

export const updateBooking = async (
    id: number,
    booking: Partial<BookingObjectionModel>,
): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    const existingDatabaseModel = await BookingObjectionModel.query()
        .findById(id)
        .orderBy('id')
        .withGraphFetched('equipmentLists.listEntries');

    // EquipmentLists.
    if (booking.equipmentLists !== undefined) {
        const {
            toAdd: equipmentListsToAdd,
            toDelete: equipmentListsToDelete,
            toUpdate: equipmentListsToUpdate,
        } = compareLists(booking.equipmentLists, existingDatabaseModel?.equipmentLists);

        equipmentListsToAdd.map(async (x) => {
            await BookingObjectionModel.relatedQuery('equipmentLists')
                .for(id)
                .insert(withCreatedDate(removeIdAndDates(x)));
        });

        equipmentListsToDelete.map(async (x) => {
            await EquipmentListObjectionModel.query().deleteById(x.id);
        });

        equipmentListsToUpdate.map(async (x) => {
            await EquipmentListObjectionModel.query().patchAndFetchById(x.id, withUpdatedDate(removeIdAndDates(x)));
        });
    }

    await BookingObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(booking)));

    return fetchBookingWithUser(id);
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

    if (
        booking.bookingType !== undefined &&
        booking.bookingType !== null &&
        !isMemberOfEnum(booking.bookingType, BookingType)
    )
        return false;
    if (booking.status !== undefined && booking.status !== null && !isMemberOfEnum(booking.status, Status))
        return false;
    if (booking.pricePlan !== undefined && booking.pricePlan !== null && !isMemberOfEnum(booking.pricePlan, PricePlan))
        return false;
    if (
        booking.accountKind !== undefined &&
        booking.accountKind !== null &&
        !isMemberOfEnum(booking.accountKind, AccountKind)
    )
        return false;

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
        .withGraphJoined('equipmentLists.listEntries')
        .withGraphJoined('equipmentLists.listHeadings.listEntries')
        .where((builder) =>
            builder
                .where('equipmentLists:listEntries.equipmentId', equipmentId)
                .orWhere('equipmentLists:listHeadings:listEntries.equipmentId', equipmentId),
        );

    if (endDatetime && startDatetime) {
        query = query
            .andWhere((builder) =>
                builder
                    .where('equipmentLists.equipmentOutDatetime', '<=', endDatetime.toISOString())
                    .orWhere((builder) =>
                        builder
                            .whereNull('equipmentLists.equipmentOutDatetime')
                            .andWhere('equipmentLists.usageStartDatetime', '<=', endDatetime.toISOString()),
                    ),
            )
            .andWhere((builder) =>
                builder
                    .where('equipmentLists.equipmentInDatetime', '>=', startDatetime.toISOString())
                    .orWhere((builder) =>
                        builder
                            .whereNull('equipmentLists.equipmentInDatetime')
                            .andWhere('equipmentLists.usageEndDatetime', '>=', startDatetime.toISOString()),
                    ),
            );
    }

    if (ignoreEquipmentListId) {
        query = query.whereNot('equipmentLists.id', ignoreEquipmentListId);
    }

    return query.select();
};

export const registerUserAsCoOwnerForBooking = async (
    userId: number,
    bookingId: number,
): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    await BookingObjectionModel.relatedQuery('coOwnerUsers').for(bookingId).relate(userId);

    return fetchBookingWithUser(bookingId);
};
export const unRegisterUserAsCoOwnerForBooking = async (
    userId: number,
    bookingId: number,
): Promise<BookingObjectionModel> => {
    ensureDatabaseIsInitialized();

    await BookingObjectionModel.relatedQuery('coOwnerUsers').for(bookingId).findById(userId).unrelate();

    return fetchBookingWithUser(bookingId);
};
