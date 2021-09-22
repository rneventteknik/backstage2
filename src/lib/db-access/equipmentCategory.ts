import { EquipmentCategoryObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';

export const fetchEquipmentCategoriess = async (): Promise<EquipmentCategoryObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentCategoryObjectionModel.query();
};
