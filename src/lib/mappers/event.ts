import { Event } from '../../models/interfaces';
import { EquipmentList, EquipmentListEntry } from '../../models/interfaces/EquipmentList';
import { IEventObjectionModel } from '../../models/objection-models';
import {
    IEquipmentListObjectionModel,
    IEquipmentListEntryObjectionModel,
} from '../../models/objection-models/EventObjectionModel';
import { toDateOrUndefined } from '../utils';
import { toEquipment, toEquipmentPrice } from './equipment';
import { toUser } from './user';
import { PartialDeep } from 'type-fest';
import { toTimeEstimate } from './timeEstimate';

export const toEvent = (objectionModel: IEventObjectionModel): Event => {
    if (!objectionModel.id) {
        throw new Error('Invalid event');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        ownerUser: objectionModel.ownerUser ? toUser(objectionModel.ownerUser) : undefined,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
        equipmentLists: objectionModel.equipmentLists ? objectionModel.equipmentLists.map(toEquipmentList) : undefined,
        timeEstimates: objectionModel.timeEstimates ? objectionModel.timeEstimates.map(toTimeEstimate) : undefined,
    };
};

export const toEquipmentList = (objectionModel: IEquipmentListObjectionModel): EquipmentList => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment list');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
        equipmentInDatetime: toDateOrUndefined(objectionModel.equipmentInDatetime),
        equipmentOutDatetime: toDateOrUndefined(objectionModel.equipmentOutDatetime),
        usageStartDatetime: toDateOrUndefined(objectionModel.usageStartDatetime),
        usageEndDatetime: toDateOrUndefined(objectionModel.usageEndDatetime),
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
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};

export const toEquipmentListObjectionModel = (
    clientModel: EquipmentList,
    eventId: number,
): PartialDeep<IEquipmentListObjectionModel> => {
    return {
        ...clientModel,
        created: undefined,
        updated: undefined,
        id: clientModel.id,
        eventId: eventId,
        equipmentInDatetime: clientModel.equipmentInDatetime?.toISOString(),
        equipmentOutDatetime: clientModel.equipmentOutDatetime?.toISOString(),
        usageStartDatetime: clientModel.usageStartDatetime?.toISOString(),
        usageEndDatetime: clientModel.usageEndDatetime?.toISOString(),
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
        equipmentPriceId: clientModel.equipmentPrice?.id,
    };
};
