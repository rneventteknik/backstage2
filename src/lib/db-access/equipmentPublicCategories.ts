import { EquipmentPublicCategoryObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { withCreatedDate, removeIdAndDates } from './utils';

export const fetchEquipmentPublicCategories = async (): Promise<EquipmentPublicCategoryObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentPublicCategoryObjectionModel.query();
};

// This function fetches the categories, but only with information that should be publicly available.
// It is used by the publicly exposed API for the public price list.
export const fetchEquipmentPublicCategoriesPublic = async (): Promise<EquipmentPublicCategoryObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentPublicCategoryObjectionModel.query().select('id', 'name', 'description', 'sortIndex');
};

export const insertEquipmentPublicCategory = async (
    equipmentPublicCategory: EquipmentPublicCategoryObjectionModel,
): Promise<EquipmentPublicCategoryObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentPublicCategoryObjectionModel.query().insert(
        withCreatedDate(removeIdAndDates(equipmentPublicCategory)),
    );
};

export const validateEquipmentPublicCategoryObjectionModel = (
    equipmentPublicCategory: EquipmentPublicCategoryObjectionModel,
): boolean => {
    if (!equipmentPublicCategory) return false;

    if (!equipmentPublicCategory.name) return false;

    return true;
};
