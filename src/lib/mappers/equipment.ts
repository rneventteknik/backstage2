import { Equipment, EquipmentPrice } from '../../models/interfaces';
import {
    IEquipmentObjectionModel,
    IEquipmentTagObjectionModel,
    IEquipmentChangelogEntryObjectionModel,
    IEquipmentPriceObjectionModel,
    IEquipmentPublicCategoryObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { EquipmentChangelogEntry } from '../../models/interfaces/ChangeLogEntry';
import { EquipmentTag } from '../../models/interfaces';
import { toDateOrUndefined } from '../utils';
import { toUser } from './user';
import { EquipmentPublicCategory } from '../../models/interfaces/EquipmentPublicCategory';

export const toEquipment = (objectionModel: IEquipmentObjectionModel): Equipment => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        image: undefined,
        tags: objectionModel.tags ? objectionModel.tags.map((x) => toEquipmentTag(x)) : [],
        prices: objectionModel.prices ? objectionModel.prices.map((x) => toEquipmentPrice(x)) : [],
        changeLog: objectionModel.changeLog ? objectionModel.changeLog.map((x) => toEquipmentChangelogEntry(x)) : [],
        equipmentPublicCategory: objectionModel.equipmentPublicCategory
            ? toEquipmentPublicCategory(objectionModel.equipmentPublicCategory)
            : undefined,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};

export const toEquipmentTag = (objectionModel: IEquipmentTagObjectionModel): EquipmentTag => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment tag');
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
        throw new Error('Invalid equipment category');
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
        throw new Error('Invalid equipment change log entry');
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

export const toEquipmentPublicCategory = (
    objectionModel: IEquipmentPublicCategoryObjectionModel,
): EquipmentPublicCategory => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment public category');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDateOrUndefined(objectionModel.updated),
        created: toDateOrUndefined(objectionModel.created),
    };
};
