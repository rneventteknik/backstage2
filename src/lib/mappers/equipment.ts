import { Equipment, EquipmentPrice } from '../../models/interfaces';
import {
    IEquipmentObjectionModel,
    IEquipmentCategoryObjectionModel,
    IEquipmentChangelogEntryObjectionModel,
    IEquipmentPriceObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { EquipmentChangelogEntry } from '../../models/interfaces/ChangeLogEntry';
import { EquipmentCategory } from '../../models/interfaces';
import { toDateOrUndefined } from '../utils';
import { toUser } from './user';

export const toEquipment = (objectionModel: IEquipmentObjectionModel): Equipment => {
    if (!objectionModel.id) {
        throw 'Invalid equipment';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        image: undefined,
        categories: objectionModel.categories ? objectionModel.categories.map((x) => toEquipmentCategory(x)) : [],
        prices: objectionModel.prices ? objectionModel.prices.map((x) => toEquipmentPrice(x)) : [],
        changeLog: objectionModel.changeLog ? objectionModel.changeLog.map((x) => toEquipmentChangelogEntry(x)) : [],
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};

export const toEquipmentCategory = (objectionModel: IEquipmentCategoryObjectionModel): EquipmentCategory => {
    if (!objectionModel.id) {
        throw 'Invalid equipment category';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};

export const toEquipmentPrice = (objectionModel: IEquipmentPriceObjectionModel): EquipmentPrice => {
    if (!objectionModel.id) {
        throw 'Invalid equipment category';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};

export const toEquipmentChangelogEntry = (
    objectionModel: IEquipmentChangelogEntryObjectionModel,
): EquipmentChangelogEntry => {
    if (!objectionModel.id) {
        throw 'Invalid equipment change log entry';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        timestamp: new Date(objectionModel.timestamp),
        user: objectionModel.user ? toUser(objectionModel.user) : undefined,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};
