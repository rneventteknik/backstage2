import { EquipmentLocationObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';

export const fetchEquipmentLocations = async (): Promise<EquipmentLocationObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentLocationObjectionModel.query();
};
