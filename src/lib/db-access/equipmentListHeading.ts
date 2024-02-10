import Objection from 'objection';
import {
    EquipmentListEntryObjectionModel,
    EquipmentListHeadingObjectionModel,
    EquipmentListObjectionModel,
} from '../../models/objection-models/BookingObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchEquipmentListHeading = async (
    id: number,
    trx?: Objection.Transaction,
): Promise<EquipmentListHeadingObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return EquipmentListHeadingObjectionModel.query(trx)
        .findById(id)
        .orderBy('id')
        .withGraphFetched('listEntries.equipment.prices')
        .withGraphFetched('listEntries.equipment.equipmentLocation')
        .withGraphFetched('listEntries.equipmentPrice');
};

export const updateEquipmentListHeading = async (
    id: number,
    equipmentListHeading: EquipmentListHeadingObjectionModel,
): Promise<EquipmentListHeadingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentListHeadingObjectionModel.transaction(async (trx) => {
        const existingDatabaseModel = await EquipmentListHeadingObjectionModel.query(trx)
            .findById(id)
            .orderBy('id')
            .withGraphFetched('listEntries.equipment');

        // List entries.
        if (equipmentListHeading.listEntries !== undefined) {
            const {
                toAdd: listEntriesToAdd,
                toDelete: listEntriesToDelete,
                toUpdate: listEntriesToUpdate,
            } = compareLists(equipmentListHeading.listEntries, existingDatabaseModel?.listEntries);

            await Promise.all(
                listEntriesToAdd.map(async (x) => {
                    await EquipmentListHeadingObjectionModel.relatedQuery('listEntries', trx)
                        .for(id)
                        .insert(withCreatedDate(removeIdAndDates(x)));
                }),
            );

            await Promise.all(
                listEntriesToDelete.map(async (x) => {
                    await EquipmentListEntryObjectionModel.query(trx).deleteById(x.id);
                }),
            );

            await Promise.all(
                listEntriesToUpdate.map(async (x) => {
                    await EquipmentListEntryObjectionModel.query(trx).patchAndFetchById(
                        x.id,
                        withCreatedDate(removeIdAndDates(x)),
                    );
                }),
            );
        }

        const res = await EquipmentListHeadingObjectionModel.query(trx).patchAndFetchById(
            id,
            withUpdatedDate(removeIdAndDates(equipmentListHeading)),
        );

        const newEquipmentListHeading = await fetchEquipmentListHeading(res.id, trx);

        if (!newEquipmentListHeading) {
            throw new Error('Invalid DB state');
        }

        return newEquipmentListHeading;
    });
};

export const insertEquipmentListHeading = async (
    equipmentListHeading: EquipmentListHeadingObjectionModel,
    equipmentListId: number,
): Promise<EquipmentListHeadingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return await EquipmentListHeadingObjectionModel.transaction(async (trx) => {
        const res = await EquipmentListObjectionModel.relatedQuery('listHeadings', trx)
            .for(equipmentListId)
            .insert(withCreatedDate(removeIdAndDates(equipmentListHeading)));

        await Promise.all(
            equipmentListHeading.listEntries.map(async (x) => {
                await EquipmentListHeadingObjectionModel.relatedQuery('listEntries', trx)
                    .for(res.id)
                    .insert(withCreatedDate(removeIdAndDates(x)));
            }),
        );

        const newEquipmentListHeading = await fetchEquipmentListHeading(res.id, trx);

        if (!newEquipmentListHeading) {
            throw new Error('Invalid DB state');
        }

        return newEquipmentListHeading;
    });
};

export const deleteEquipmentListHeading = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return EquipmentListHeadingObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentListHeadingObjectionModel = (
    equipmentListHeading: EquipmentListHeadingObjectionModel,
): boolean => {
    if (!equipmentListHeading) return false;

    if (equipmentListHeading.name === null) return false;

    return true;
};
