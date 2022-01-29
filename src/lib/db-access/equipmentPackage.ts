import { EquipmentPackageObjectionModel } from '../../models/objection-models/EquipmentPackageObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

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
        .withGraphFetched('equipmentEntries.equipment')
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

    // Tags. To keep it simple for now we delete all the old links and create new ones.
    if (equipmentPackage.tags !== undefined) {
        await EquipmentPackageObjectionModel.relatedQuery('tags').for(id).unrelate();

        if (equipmentPackage.tags.length > 0) {
            equipmentPackage.tags.map(async (x) => {
                if (x.id) {
                    await EquipmentPackageObjectionModel.relatedQuery('tags').for(id).relate(x.id);
                }
            });
        }
    }

    // Equipment. To keep it simple for now we delete all the old equipment entries and create new ones.
    if (equipmentPackage.equipmentEntries !== undefined) {
        await EquipmentPackageObjectionModel.relatedQuery('equipmentEntries').for(id).delete();

        if (equipmentPackage.equipmentEntries.length > 0) {
            equipmentPackage.equipmentEntries.map(async (x) => {
                await EquipmentPackageObjectionModel.relatedQuery('equipmentEntries')
                    .for(id)
                    .insert(withCreatedDate(removeIdAndDates(x)));
            });
        }
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
