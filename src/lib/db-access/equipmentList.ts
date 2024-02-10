import Objection from 'objection';
import {
    EquipmentListEntryObjectionModel,
    EquipmentListObjectionModel,
    BookingObjectionModel,
    EquipmentListHeadingObjectionModel,
} from '../../models/objection-models/BookingObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { validateEquipmentListEntryObjectionModel } from './equipmentListEntry';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchEquipmentList = async (
    id: number,
    trx?: Objection.Transaction,
): Promise<EquipmentListObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return EquipmentListObjectionModel.query(trx)
        .findById(id)
        .orderBy('id')
        .withGraphFetched('listEntries.equipment.prices')
        .withGraphFetched('listEntries.equipment.equipmentLocation')
        .withGraphFetched('listEntries.equipmentPrice')
        .withGraphFetched('listHeadings.listEntries.equipment.prices')
        .withGraphFetched('listHeadings.listEntries.equipment.equipmentLocation')
        .withGraphFetched('listHeadings.listEntries.equipmentPrice')
        .modifyGraph('listEntries', (builder) => {
            builder.orderBy('id');
        });
};

export const fetchEquipmentLists = async (): Promise<EquipmentListObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentListObjectionModel.query()
        .withGraphFetched('listEntries.equipment')
        .withGraphFetched('listHeadings.listEntries.equipment');
};

export const fetchEquipmentListsForBooking = async (bookingId: number): Promise<EquipmentListObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentListObjectionModel.query().where('bookingId', bookingId).orderBy('id');
};

export const updateEquipmentList = async (
    id: number,
    equipmentList: EquipmentListObjectionModel,
): Promise<EquipmentListObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentListObjectionModel.transaction(async (trx) => {
        const existingDatabaseModel = await EquipmentListObjectionModel.query(trx)
            .findById(id)
            .orderBy('id')
            .withGraphFetched('listEntries.equipment')
            .withGraphFetched('listHeadings.listEntries.equipment');

        // List entries.
        if (equipmentList.listEntries !== undefined) {
            const {
                toAdd: listEntriesToAdd,
                toDelete: listEntriesToDelete,
                toUpdate: listEntriesToUpdate,
            } = compareLists(equipmentList.listEntries, existingDatabaseModel?.listEntries);

            await Promise.all(
                listEntriesToAdd.map(async (x) => {
                    await EquipmentListObjectionModel.relatedQuery('listEntries', trx)
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

        // Heading entries.
        if (equipmentList.listHeadings !== undefined) {
            const {
                toAdd: headingListEntriesToAdd,
                toDelete: headingListEntriesToDelete,
                toUpdate: headingListEntriesToUpdate,
            } = compareLists(equipmentList.listHeadings, existingDatabaseModel?.listHeadings);

            await Promise.all(
                headingListEntriesToAdd.map(async (x) => {
                    const res = await EquipmentListObjectionModel.relatedQuery('listHeadings', trx)
                        .for(id)
                        .insert(withCreatedDate(removeIdAndDates(x)));

                    if (x.listEntries) {
                        x.listEntries.map(async (y) => {
                            await EquipmentListHeadingObjectionModel.relatedQuery('listEntries', trx)
                                .for(res.id)
                                .insert(withCreatedDate(removeIdAndDates(y)));
                        });
                    }
                }),
            );

            await Promise.all(
                headingListEntriesToDelete.map(async (x) => {
                    await EquipmentListHeadingObjectionModel.query(trx).deleteById(x.id);
                }),
            );

            await Promise.all(
                headingListEntriesToUpdate.map(async (x) => {
                    await EquipmentListHeadingObjectionModel.query(trx).patchAndFetchById(
                        x.id,
                        withCreatedDate(removeIdAndDates(x)),
                    );

                    const existingHeaderDatabaseModel = await EquipmentListHeadingObjectionModel.query(trx)
                        .findById(x.id)
                        .withGraphFetched('listEntries');

                    if (!existingHeaderDatabaseModel) {
                        throw new Error('Invalid DB state');
                    }

                    const {
                        toAdd: listEntriesToAdd,
                        toDelete: listEntriesToDelete,
                        toUpdate: listEntriesToUpdate,
                    } = compareLists(x.listEntries, existingHeaderDatabaseModel?.listEntries);

                    listEntriesToAdd.map(async (y) => {
                        await EquipmentListHeadingObjectionModel.relatedQuery('listEntries', trx)
                            .for(x.id)
                            .insert(withCreatedDate(removeIdAndDates(y)));
                    });

                    listEntriesToDelete.map(async (y) => {
                        await EquipmentListEntryObjectionModel.query(trx).deleteById(y.id);
                    });

                    listEntriesToUpdate.map(async (y) => {
                        await EquipmentListEntryObjectionModel.query(trx).patchAndFetchById(
                            y.id,
                            withCreatedDate(removeIdAndDates(y)),
                        );
                    });
                }),
            );
        }

        const res = await EquipmentListObjectionModel.query(trx).patchAndFetchById(
            id,
            withUpdatedDate(removeIdAndDates(equipmentList)),
        );

        const newEquipmentList = await fetchEquipmentList(res.id, trx);

        if (!newEquipmentList) {
            throw new Error('Invalid DB state');
        }

        return newEquipmentList;
    });
};

export const insertEquipmentList = async (
    equipmentList: EquipmentListObjectionModel,
    bookingId: number,
): Promise<EquipmentListObjectionModel> => {
    ensureDatabaseIsInitialized();

    return BookingObjectionModel.relatedQuery('equipmentLists')
        .for(bookingId)
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

    if (equipmentList.name === null) return false;

    if (
        equipmentList.listEntries &&
        equipmentList.listEntries.some((x) => !validateEquipmentListEntryObjectionModel(x, true))
    )
        return false;

    return true;
};
