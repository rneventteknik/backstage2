import { Booking } from '../../models/interfaces';
import { EquipmentList, EquipmentListEntry } from '../../models/interfaces/EquipmentList';
import { IBookingObjectionModel } from '../../models/objection-models';
import {
    IEquipmentListObjectionModel,
    IEquipmentListEntryObjectionModel,
    IBookingChangelogEntryObjectionModel,
} from '../../models/objection-models/BookingObjectionModel';
import { toEquipment, toEquipmentPrice } from './equipment';
import { toUser } from './user';
import { PartialDeep } from 'type-fest';
import { toTimeEstimate } from './timeEstimate';
import { BookingChangelogEntry } from '../../models/interfaces/ChangeLogEntry';
import { toTimeReport } from './timeReport';
import { toDatetimeOrUndefined } from '../datetimeUtils';

export const toBooking = (objectionModel: IBookingObjectionModel): Booking => {
    if (!objectionModel.id) {
        throw new Error('Invalid booking');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        ownerUser: objectionModel.ownerUser ? toUser(objectionModel.ownerUser) : undefined,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
        equipmentLists: objectionModel.equipmentLists ? objectionModel.equipmentLists.map(toEquipmentList) : undefined,
        timeEstimates: objectionModel.timeEstimates ? objectionModel.timeEstimates.map(toTimeEstimate) : undefined,
        changelog: objectionModel.changelog ? objectionModel.changelog.map(toBookingChangelogEntry) : undefined,
        timeReports: objectionModel.timeReports ? objectionModel.timeReports.map(toTimeReport) : undefined,
    };
};

export const toEquipmentList = (objectionModel: IEquipmentListObjectionModel): EquipmentList => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment list');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
        equipmentInDatetime: toDatetimeOrUndefined(objectionModel.equipmentInDatetime),
        equipmentOutDatetime: toDatetimeOrUndefined(objectionModel.equipmentOutDatetime),
        usageStartDatetime: toDatetimeOrUndefined(objectionModel.usageStartDatetime),
        usageEndDatetime: toDatetimeOrUndefined(objectionModel.usageEndDatetime),
        equipmentListEntries: objectionModel.equipmentListEntries
            ? objectionModel.equipmentListEntries.map((x) => toEquipmentListEntry(x))
            : [],
    };
};

export const toEquipmentListEntry = (objectionModel: IEquipmentListEntryObjectionModel): EquipmentListEntry => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment list entry');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        equipment: objectionModel.equipment ? toEquipment(objectionModel.equipment) : undefined,
        equipmentId: objectionModel.equipmentId,
        equipmentPrice: objectionModel.equipmentPrice ? toEquipmentPrice(objectionModel.equipmentPrice) : undefined,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};

export const toBookingChangelogEntry = (
    objectionModel: IBookingChangelogEntryObjectionModel,
): BookingChangelogEntry => {
    if (!objectionModel.id) {
        throw new Error('Invalid changelog entry');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};

export const toEquipmentListObjectionModel = (
    clientModel: EquipmentList,
    bookingId: number,
): PartialDeep<IEquipmentListObjectionModel> => {
    return {
        ...clientModel,
        created: undefined,
        updated: undefined,
        id: clientModel.id,
        bookingId: bookingId,
        equipmentInDatetime: clientModel.equipmentInDatetime
            ? clientModel.equipmentInDatetime.toISOString()
            : clientModel.equipmentInDatetime,
        equipmentOutDatetime: clientModel.equipmentOutDatetime
            ? clientModel.equipmentOutDatetime.toISOString()
            : clientModel.equipmentOutDatetime,
        usageStartDatetime: clientModel.usageStartDatetime
            ? clientModel.usageStartDatetime.toISOString()
            : clientModel.usageStartDatetime,
        usageEndDatetime: clientModel.usageEndDatetime
            ? clientModel.usageEndDatetime.toISOString()
            : clientModel.usageEndDatetime,
        equipmentListEntries: clientModel.equipmentListEntries
            ? clientModel.equipmentListEntries.map((x) => toEquipmentListEntryObjectionModel(x))
            : [],
    };
};

export const toEquipmentListEntryObjectionModel = (
    clientModel: EquipmentListEntry,
): Partial<IEquipmentListEntryObjectionModel> => {
    return {
        ...clientModel,
        created: undefined,
        updated: undefined,
        id: clientModel.id,
        equipment: undefined,
        equipmentId: clientModel.equipment?.id,
        equipmentPrice: undefined,
        equipmentPriceId: clientModel.equipmentPrice?.id ?? null,
    };
};
