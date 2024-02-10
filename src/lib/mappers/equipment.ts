import { Equipment, EquipmentPrice, EquipmentTag } from '../../models/interfaces';
import {
    IEquipmentObjectionModel,
    IEquipmentTagObjectionModel,
    IEquipmentChangelogEntryObjectionModel,
    IEquipmentPriceObjectionModel,
    IEquipmentPublicCategoryObjectionModel,
    IEquipmentLocationObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { EquipmentChangelogEntry } from '../../models/interfaces/ChangeLogEntry';
import { EquipmentPublicCategory } from '../../models/interfaces/EquipmentPublicCategory';
import { EquipmentLocation } from '../../models/interfaces/EquipmentLocation';
import { toDatetimeOrUndefined } from '../datetimeUtils';

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
        changelog: objectionModel.changelog ? objectionModel.changelog.map((x) => toEquipmentChangelogEntry(x)) : [],
        equipmentPublicCategory: objectionModel.equipmentPublicCategory
            ? toEquipmentPublicCategory(objectionModel.equipmentPublicCategory)
            : undefined,
        equipmentLocation: objectionModel.equipmentLocation
            ? toEquipmentLocation(objectionModel.equipmentLocation)
            : undefined,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};

export const toEquipmentTag = (objectionModel: IEquipmentTagObjectionModel): EquipmentTag => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment tag');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
        equipment: objectionModel.equipment ? objectionModel.equipment.map((x) => toEquipment(x)) : [],
    };
};

export const toEquipmentPrice = (objectionModel: IEquipmentPriceObjectionModel): EquipmentPrice => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment category');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
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
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
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
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};

export const toEquipmentLocation = (objectionModel: IEquipmentLocationObjectionModel): EquipmentLocation => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment location');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};

export const toEquipmentPriceObjectionModel = (clientModel: EquipmentPrice): Partial<IEquipmentPriceObjectionModel> => {
    if (!clientModel.id) {
        throw new Error('Invalid equipment list entry');
    }

    return {
        ...clientModel,
        created: undefined,
        updated: undefined,
    };
};
