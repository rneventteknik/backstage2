import { EquipmentLocationObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { withCreatedDate, removeIdAndDates } from './utils';

export const fetchEquipmentLocations = async (): Promise<EquipmentLocationObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentLocationObjectionModel.query();
};

export const insertEquipmentLocation = async (
    equipmentLocation: EquipmentLocationObjectionModel,
): Promise<EquipmentLocationObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentLocationObjectionModel.query().insert(withCreatedDate(removeIdAndDates(equipmentLocation)));
};

export const validateEquipmentLocationObjectionModel = (
    equipmentLocation: EquipmentLocationObjectionModel,
): boolean => {
    if (!equipmentLocation) return false;

    if (!equipmentLocation.name) return false;

    return true;
};
