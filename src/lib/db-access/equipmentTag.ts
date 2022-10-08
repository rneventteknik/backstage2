import { EquipmentTagObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { withCreatedDate, removeIdAndDates } from './utils';

export const fetchEquipmentTags = async (): Promise<EquipmentTagObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentTagObjectionModel.query();
};

export const fetchEquipmentTagWithEquipment = async (id: number): Promise<EquipmentTagObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return EquipmentTagObjectionModel.query().findById(id).withGraphFetched('equipment');
};

export const searchEquipmentTag = async (
    searchString: string,
    count: number,
): Promise<EquipmentTagObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return EquipmentTagObjectionModel.query()
        .where('name', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orderBy('updated', 'desc')
        .limit(count);
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
