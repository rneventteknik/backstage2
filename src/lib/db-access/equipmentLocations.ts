import { EquipmentLocationObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { withCreatedDate, removeIdAndDates, withUpdatedDate } from './utils';

export const fetchEquipmentLocations = async (): Promise<EquipmentLocationObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentLocationObjectionModel.query();
};

export const fetchEquipmentLocation = async (id: number): Promise<EquipmentLocationObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return EquipmentLocationObjectionModel.query().findById(id);
};

export const insertEquipmentLocation = async (
    equipmentLocation: EquipmentLocationObjectionModel,
): Promise<EquipmentLocationObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentLocationObjectionModel.query().insert(withCreatedDate(removeIdAndDates(equipmentLocation)));
};

export const updateEquipmentLocation = async (
    id: number,
    equipmentLocation: EquipmentLocationObjectionModel,
): Promise<EquipmentLocationObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentLocationObjectionModel.query().patchAndFetchById(
        id,
        withUpdatedDate(removeIdAndDates(equipmentLocation)),
    );
};

export const deleteEquipmentLocation = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return EquipmentLocationObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentLocationObjectionModel = (
    equipmentLocation: EquipmentLocationObjectionModel,
): boolean => {
    if (!equipmentLocation) return false;

    if (!equipmentLocation.name) return false;

    return true;
};
