import { Equipment, EquipmentPrice } from '../../interfaces';
import {
    IEquipmentApiModel,
    IEquipmentCategoryApiModel,
    IEquipmentChangelogEntryApiModel,
    IEquipmentPriceApiModel,
} from '../../interfaces/api-models/EquipmentApiModel';
import { EquipmentChangelogEntry } from '../../interfaces/ChangeLogEntry';
import { EquipmentCategory } from '../../interfaces/EquipmentCategory';
import { toDateOrUndefined } from '../utils';
import { toUser } from './user';

export const toEquipment = (apiModel: IEquipmentApiModel): Equipment => {
    if (!apiModel.id) {
        throw 'Invalid equipment';
    }

    return {
        ...apiModel,
        id: apiModel.id,
        image: undefined,
        categories: apiModel.categories ? apiModel.categories.map((x) => toEquipmentCategory(x)) : [],
        prices: apiModel.prices ? apiModel.prices.map((x) => toEquipmentPrice(x)) : [],
        changeLog: apiModel.changeLog ? apiModel.changeLog.map((x) => toEquipmentChangelogEntry(x)) : [],
        updated: toDateOrUndefined(apiModel.updated),
        created: toDateOrUndefined(apiModel.created),
    };
};

export const toEquipmentCategory = (apiModel: IEquipmentCategoryApiModel): EquipmentCategory => {
    if (!apiModel.id) {
        throw 'Invalid equipment category';
    }

    return {
        ...apiModel,
        id: apiModel.id,
        updated: toDateOrUndefined(apiModel.updated),
        created: toDateOrUndefined(apiModel.created),
    };
};

export const toEquipmentPrice = (apiModel: IEquipmentPriceApiModel): EquipmentPrice => {
    if (!apiModel.id) {
        throw 'Invalid equipment category';
    }

    return {
        ...apiModel,
        id: apiModel.id,
        updated: toDateOrUndefined(apiModel.updated),
        created: toDateOrUndefined(apiModel.created),
    };
};

export const toEquipmentChangelogEntry = (apiModel: IEquipmentChangelogEntryApiModel): EquipmentChangelogEntry => {
    if (!apiModel.id) {
        throw 'Invalid equipment change log entry';
    }

    return {
        ...apiModel,
        id: apiModel.id,
        timestamp: new Date(apiModel.timestamp),
        user: apiModel.user ? toUser(apiModel.user) : undefined,
        updated: toDateOrUndefined(apiModel.updated),
        created: toDateOrUndefined(apiModel.created),
    };
};
