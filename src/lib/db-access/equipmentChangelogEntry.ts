import { EquipmentChangelogEntryObjectionModel } from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchEquipmentChangelogEntry = async (
    id: number,
): Promise<EquipmentChangelogEntryObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return EquipmentChangelogEntryObjectionModel.query().findById(id);
};

export const fetchEquipmentChangelogEntries = async (): Promise<EquipmentChangelogEntryObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentChangelogEntryObjectionModel.query();
};

export const fetchEquipmentChangelogEntrysByEquipmentId = async (
    id: number,
): Promise<EquipmentChangelogEntryObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentChangelogEntryObjectionModel.query().where('equipmentId', id);
};

export const updateEquipmentChangelogEntry = async (
    id: number,
    equipmentChangelogEntry: EquipmentChangelogEntryObjectionModel,
): Promise<EquipmentChangelogEntryObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentChangelogEntryObjectionModel.query().patchAndFetchById(
        id,
        withUpdatedDate(removeIdAndDates(equipmentChangelogEntry)),
    );
};

export const insertEquipmentChangelogEntry = async (
    equipmentChangelogEntry: Partial<EquipmentChangelogEntryObjectionModel>,
): Promise<EquipmentChangelogEntryObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentChangelogEntryObjectionModel.query().insert(
        withCreatedDate(removeIdAndDates(equipmentChangelogEntry)),
    );
};

export const deleteEquipmentChangelogEntry = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return EquipmentChangelogEntryObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentChangelogEntryObjectionModel = (
    equipmentChangelogEntry: EquipmentChangelogEntryObjectionModel,
): boolean => {
    if (!equipmentChangelogEntry) return false;

    return true;
};
