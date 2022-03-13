import {
    EquipmentPackageEntryObjectionModel,
    EquipmentPackageObjectionModel,
} from '../../models/objection-models/EquipmentPackageObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchEquipmentPackage = async (
    searchString: string,
    count: number,
): Promise<EquipmentPackageObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return EquipmentPackageObjectionModel.query()
        .where('name', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orderBy('updated', 'desc')
        .withGraphFetched('tags')
        .limit(count);
};

export const fetchEquipmentPackage = async (id: number): Promise<EquipmentPackageObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentPackageObjectionModel.query()
        .findById(id)
        .withGraphFetched('equipmentEntries.equipment.prices')
        .withGraphFetched('tags');
};

export const fetchEquipmentPackages = async (): Promise<EquipmentPackageObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentPackageObjectionModel.query()
        .withGraphFetched('equipmentEntries.equipment')
        .withGraphFetched('tags');
};

export const updateEquipmentPackage = async (
    id: number,
    equipmentPackage: EquipmentPackageObjectionModel,
): Promise<EquipmentPackageObjectionModel> => {
    ensureDatabaseIsInitialized();

    const existingDatabaseModel = await EquipmentPackageObjectionModel.query()
        .findById(id)
        .orderBy('id')
        .withGraphFetched('tags')
        .withGraphFetched('equipmentEntries');

    // Tags.
    if (equipmentPackage.tags) {
        const { toAdd: tagsToAdd, toDelete: tagsToDelete } = compareLists(
            equipmentPackage.tags,
            existingDatabaseModel.tags,
        );

        tagsToAdd.map(async (x) => {
            await EquipmentPackageObjectionModel.relatedQuery('tags').for(id).relate(x.id);
        });

        tagsToDelete.map(async (x) => {
            await EquipmentPackageObjectionModel.relatedQuery('tags').for(id).findById(x.id).unrelate();
        });
    }

    // EquipmentEntries.
    if (equipmentPackage.equipmentEntries !== undefined) {
        const {
            toAdd: equipmentEntriesToAdd,
            toDelete: equipmentEntriesToDelete,
            toUpdate: equipmentEntriesToUpdate,
        } = compareLists(equipmentPackage.equipmentEntries, existingDatabaseModel.equipmentEntries);

        equipmentEntriesToAdd.map(async (x) => {
            await EquipmentPackageObjectionModel.relatedQuery('equipmentEntries')
                .for(id)
                .insert(withCreatedDate(removeIdAndDates(x)));
        });

        equipmentEntriesToDelete.map(async (x) => {
            await EquipmentPackageEntryObjectionModel.query().deleteById(x.id);
        });

        equipmentEntriesToUpdate.map(async (x) => {
            await EquipmentPackageEntryObjectionModel.query().patchAndFetchById(
                x.id,
                withUpdatedDate(removeIdAndDates(x)),
            );
        });
    }

    return EquipmentPackageObjectionModel.query().patchAndFetchById(
        id,
        withUpdatedDate(removeIdAndDates(equipmentPackage)),
    );
};

export const insertEquipmentPackage = async (
    equipmentPackage: EquipmentPackageObjectionModel,
): Promise<EquipmentPackageObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentPackageObjectionModel.query().insert(withCreatedDate(removeIdAndDates(equipmentPackage)));
};

export const deleteEquipmentPackage = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    // Tags
    await EquipmentPackageObjectionModel.relatedQuery('tags').for(id).unrelate();

    return EquipmentPackageObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentPackageObjectionModel = (equipmentPackage: EquipmentPackageObjectionModel): boolean => {
    if (!equipmentPackage) return false;

    if (!equipmentPackage.name) return false;

    return true;
};
