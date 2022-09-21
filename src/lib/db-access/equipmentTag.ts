import { EquipmentTagObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { withCreatedDate, removeIdAndDates } from './utils';

export const fetchEquipmentTags = async (): Promise<EquipmentTagObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentTagObjectionModel.query();
};

export const insertEquipmentTag = async (
    equipmentTag: EquipmentTagObjectionModel,
): Promise<EquipmentTagObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentTagObjectionModel.query().insert(withCreatedDate(removeIdAndDates(equipmentTag)));
};

export const validateEquipmentTagObjectionModel = (equipmentTag: EquipmentTagObjectionModel): boolean => {
    if (!equipmentTag) return false;

    if (!equipmentTag.name) return false;

    return true;
};
