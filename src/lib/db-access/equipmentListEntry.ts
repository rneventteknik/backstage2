import Objection from 'objection';
import {
    EquipmentListEntryObjectionModel,
    EquipmentListHeadingObjectionModel,
    EquipmentListObjectionModel,
} from '../../models/objection-models/BookingObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchEquipmentListEntry = async (
    id: number,
    trx?: Objection.Transaction,
): Promise<EquipmentListEntryObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return EquipmentListEntryObjectionModel.query(trx)
        .findById(id)
        .orderBy('id')
        .withGraphFetched('equipment.prices')
        .withGraphFetched('equipment.equipmentLocation')
        .withGraphFetched('equipmentPrice');
};

export const updateEquipmentListEntry = async (
    id: number,
    equipmentListEntry: EquipmentListEntryObjectionModel,
): Promise<EquipmentListEntryObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentListEntryObjectionModel.transaction(async (trx) => {
        const res = await EquipmentListEntryObjectionModel.query(trx).patchAndFetchById(
            id,
            withUpdatedDate(removeIdAndDates(equipmentListEntry)),
        );

        const newEquipmentListEntry = await fetchEquipmentListEntry(res.id, trx);

        if (!newEquipmentListEntry) {
            throw new Error('Invalid DB state');
        }

        return newEquipmentListEntry;
    });
};

export const insertEquipmentListEntry = async (
    equipmentListEntry: EquipmentListEntryObjectionModel,
    equipmentListId: number | undefined,
    equipmentListHeadingId: number | undefined,
): Promise<EquipmentListEntryObjectionModel> => {
    ensureDatabaseIsInitialized();

    if (equipmentListId === undefined && equipmentListHeadingId === undefined) {
        throw new Error('Either equipmentListId or equipmentListHeadingId is required.');
    }

    if (equipmentListId !== undefined && equipmentListHeadingId !== undefined) {
        throw new Error('Both equipmentListId and equipmentListHeadingId cannot be set at the same time.');
    }

    if (equipmentListId !== undefined) {
        return EquipmentListObjectionModel.relatedQuery('listEntries')
            .for(equipmentListId)
            .insert(withCreatedDate(removeIdAndDates(equipmentListEntry)));
    }

    if (equipmentListHeadingId !== undefined) {
        return EquipmentListHeadingObjectionModel.relatedQuery('listEntries')
            .for(equipmentListHeadingId)
            .insert(withCreatedDate(removeIdAndDates(equipmentListEntry)));
    }

    throw new Error('Invalid parameters.');
};

export const deleteEquipmentListEntry = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return EquipmentListEntryObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentListEntryObjectionModel = (
    equipmentListEntry: EquipmentListEntryObjectionModel,
    allowNullRelations = false,
): boolean => {
    if (!equipmentListEntry) return false;

    if (equipmentListEntry.name === null) return false;

    if (
        equipmentListEntry.pricePerHour !== undefined &&
        (isNaN(equipmentListEntry.pricePerHour) || equipmentListEntry.pricePerHour < 0)
    ) {
        return false;
    }

    if (
        equipmentListEntry.pricePerUnit !== undefined &&
        (isNaN(equipmentListEntry.pricePerUnit) || equipmentListEntry.pricePerUnit < 0)
    ) {
        return false;
    }

    if (
        equipmentListEntry.numberOfHours !== undefined &&
        (isNaN(equipmentListEntry.numberOfHours) || equipmentListEntry.numberOfHours < 0)
    ) {
        return false;
    }

    if (
        equipmentListEntry.numberOfUnits !== undefined &&
        (isNaN(equipmentListEntry.numberOfUnits) || equipmentListEntry.numberOfUnits < 0)
    ) {
        return false;
    }

    if (
        equipmentListEntry.discount !== undefined &&
        (isNaN(equipmentListEntry.discount) || equipmentListEntry.discount < 0)
    ) {
        return false;
    }
    // Both relations (heading and list) cannot be null.
    if (
        equipmentListEntry.equipmentListId === null &&
        equipmentListEntry.equipmentListHeadingId === null &&
        !allowNullRelations
    ) {
        return false;
    }

    // Also, both relations (heading and list) cannot be set.
    if (
        equipmentListEntry.equipmentListId !== null &&
        equipmentListEntry.equipmentListHeadingId !== null &&
        equipmentListEntry.equipmentListId !== undefined &&
        equipmentListEntry.equipmentListHeadingId !== undefined &&
        !allowNullRelations
    ) {
        return false;
    }

    return true;
};
