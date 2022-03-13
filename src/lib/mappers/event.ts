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
    if (!objectionModel.id || !objectionModel.equipment) {
        throw new Error('Invalid equipment list entry');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        equipment: toEquipment(objectionModel.equipment),
        equipmentId: objectionModel.equipmentId,
        equipmentPrice: toEquipmentPrice(objectionModel.equipmentPrice),
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};

export const toEquipmentListObjectionModel = (
    clientModel: EquipmentList,
    eventId: number,
): PartialDeep<IEquipmentListObjectionModel> => {
    if (!clientModel.id) {
        throw new Error('Invalid equipment list');
    }

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
    if (!clientModel.id || !clientModel.equipment) {
        throw new Error('Invalid equipment list entry');
    }

    return {
        ...clientModel,
        created: undefined,
        updated: undefined,
        id: clientModel.id,
        equipment: undefined,
        equipmentId: clientModel.equipment.id,
        equipmentPrice: undefined,
        equipmentPriceId: clientModel.equipmentPrice.id,
    };
};
