import {
    EquipmentListEntryObjectionModel,
    EquipmentListObjectionModel,
    EventObjectionModel,
} from '../../models/objection-models/EventObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchEquipmentList = async (id: number): Promise<EquipmentListObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return EquipmentListObjectionModel.query()
        .findById(id)
        .orderBy('id')
        .withGraphFetched('equipmentListEntries.equipment.prices')
        .withGraphFetched('equipmentListEntries.equipmentPrice')
        .modifyGraph('equipmentListEntries', (builder) => {
            builder.orderBy('id');
        });
};

export const fetchEquipmentLists = async (): Promise<EquipmentListObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentListObjectionModel.query().withGraphFetched('equipmentListEntries.equipment');
};

export const fetchEquipmentListsForEvent = async (eventId: number): Promise<EquipmentListObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentListObjectionModel.query().where('eventId', eventId).orderBy('id');
};

export const updateEquipmentList = async (
    id: number,
    equipmentList: EquipmentListObjectionModel,
): Promise<EquipmentListObjectionModel> => {
    ensureDatabaseIsInitialized();

    const existingDatabaseModel = await EquipmentListObjectionModel.query()
        .findById(id)
        .orderBy('id')
        .withGraphFetched('equipmentListEntries.equipment');

    // List entries.
    if (equipmentList.equipmentListEntries !== undefined) {
        const { toAdd: listEntriesToAdd, toDelete: listEntriesToDelete, toUpdate: listEntriesToUpdate } = compareLists(
            equipmentList.equipmentListEntries,
            existingDatabaseModel?.equipmentListEntries,
        );

        listEntriesToAdd.map(async (x) => {
            await EquipmentListObjectionModel.relatedQuery('equipmentListEntries')
                .for(id)
                .insert(withCreatedDate(removeIdAndDates(x)));
        });

        listEntriesToDelete.map(async (x) => {
            await EquipmentListEntryObjectionModel.query().deleteById(x.id);
        });

        listEntriesToUpdate.map(async (x) => {
            await EquipmentListEntryObjectionModel.query().patchAndFetchById(
                x.id,
                withCreatedDate(removeIdAndDates(x)),
            );
        });
    }

    return EquipmentListObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(equipmentList)));
};

export const insertEquipmentList = async (
    equipmentList: EquipmentListObjectionModel,
    eventId: number,
): Promise<EquipmentListObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EventObjectionModel.relatedQuery('equipmentLists')
        .for(eventId)
        .insert(withCreatedDate(removeIdAndDates(equipmentList)));
};

export const deleteEquipmentList = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return EquipmentListObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentListObjectionModel = (equipmentList: EquipmentListObjectionModel): boolean => {
    if (!equipmentList) return false;

    if (!equipmentList.name) return false;

    return true;
};
