import { EquipmentTagObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';

export const fetchEquipmentTags = async (): Promise<EquipmentTagObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentTagObjectionModel.query();
};
