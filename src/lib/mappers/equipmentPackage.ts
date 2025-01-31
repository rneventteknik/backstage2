import {
    IEquipmentPackageEntryObjectionModel,
    IEquipmentPackageObjectionModel,
} from '../../models/objection-models/EquipmentPackageObjectionModel';
import { EquipmentPackage, EquipmentPackageEntry } from '../../models/interfaces/EquipmentPackage';
import { toEquipment, toEquipmentPrice, toEquipmentTag } from './equipment';
import { toDatetimeOrUndefined } from '../datetimeUtils';

export const toEquipmentPackage = (objectionModel: IEquipmentPackageObjectionModel): EquipmentPackage => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment package');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        image: undefined,
        tags: objectionModel.tags ? objectionModel.tags.map((x) => toEquipmentTag(x)) : [],
        equipmentEntries: objectionModel.equipmentEntries
            ? objectionModel.equipmentEntries.map(toEquipmentPackageEntry)
            : [],
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};

export const toEquipmentPackageEntry = (
    objectionModel: IEquipmentPackageEntryObjectionModel,
): EquipmentPackageEntry => {
    if (!objectionModel.id) {
        throw new Error('Invalid equipment package entry');
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        equipment: objectionModel.equipment ? toEquipment(objectionModel.equipment) : undefined,
        equipmentPrice: objectionModel.equipmentPrice ? toEquipmentPrice(objectionModel.equipmentPrice) : undefined,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};
