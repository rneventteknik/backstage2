import { EquipmentCategoryApiModel } from '../../interfaces/api-models/EquipmentApiModel';
import { ensureDatabaseIsInitialized } from '../database';

export const fetchEquipmentCategoriess = async (): Promise<EquipmentCategoryApiModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentCategoryApiModel.query();
};
