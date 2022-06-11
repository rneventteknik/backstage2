import {
    EquipmentObjectionModel,
    EquipmentPriceObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchEquipment = async (searchString: string, count: number): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return EquipmentObjectionModel.query()
        .where('name', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orWhere('nameEN', getCaseInsensitiveComparisonKeyword(), modifiedSearchString)
        .orderBy('updated', 'desc')
        .withGraphFetched('tags')
        .limit(count);
};

export const fetchEquipment = async (id: number): Promise<EquipmentObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.query()
        .findById(id)
        .withGraphFetched('tags')
        .withGraphFetched('equipmentPublicCategory')
        .withGraphFetched('equipmentLocation')
        .withGraphFetched('prices')
        .withGraphFetched('changeLog');
};

export const fetchEquipments = async (): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentObjectionModel.query()
        .withGraphFetched('prices')
        .withGraphFetched('tags')
        .withGraphFetched('equipmentPublicCategory')
        .withGraphFetched('equipmentLocation');
};

// This function fetches the bookings, but only with information that should be publicly available.
// It is used by the publicly exposed API for the public price list.
export const fetchEquipmentsPublic = async (): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentObjectionModel.query()
        .where('publiclyHidden', '<>', 1)
        .select('id', 'name', 'nameEN', 'description', 'descriptionEN')
        .withGraphFetched('prices(publicPriceInfo)')
        .withGraphFetched('equipmentPublicCategory(equipmentPublicCategoryInfo)')
        .modifiers({
            publicPriceInfo: (builder) => {
                builder.select('id', 'name', 'pricePerUnit', 'pricePerHour', 'pricePerUnitTHS', 'pricePerHourTHS');
            },

            equipmentPublicCategoryInfo: (builder) => {
                builder.select('id', 'name', 'description');
            },
        });
};

export const updateEquipment = async (
    id: number,
    equipment: EquipmentObjectionModel,
): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    const existingDatabaseModel = await EquipmentObjectionModel.query()
        .findById(id)
        .orderBy('id')
        .withGraphFetched('tags')
        .withGraphFetched('prices');

    // Tags.
    if (equipment.tags) {
        const { toAdd: tagsToAdd, toDelete: tagsToDelete } = compareLists(equipment.tags, existingDatabaseModel?.tags);

        tagsToAdd.map(async (x) => {
            await EquipmentObjectionModel.relatedQuery('tags').for(id).relate(x.id);
        });

        tagsToDelete.map(async (x) => {
            await EquipmentObjectionModel.relatedQuery('tags').for(id).findById(x.id).unrelate();
        });
    }

    // Prices.
    if (equipment.prices !== undefined) {
        const {
            toAdd: pricesToAdd,
            toDelete: pricesToDelete,
            toUpdate: pricesToUpdate,
        } = compareLists(equipment.prices, existingDatabaseModel?.prices);

        pricesToAdd.map(async (x) => {
            await EquipmentObjectionModel.relatedQuery('prices')
                .for(id)
                .insert(withCreatedDate(removeIdAndDates(x)));
        });

        pricesToDelete.map(async (x) => {
            await EquipmentPriceObjectionModel.query().deleteById(x.id);
        });

        pricesToUpdate.map(async (x) => {
            await EquipmentPriceObjectionModel.query().patchAndFetchById(x.id, withUpdatedDate(removeIdAndDates(x)));
        });
    }

    return EquipmentObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(equipment)));
};

export const insertEquipment = async (equipment: EquipmentObjectionModel): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.query().insert(withCreatedDate(removeIdAndDates(equipment)));
};

export const deleteEquipment = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    // Tags
    await EquipmentObjectionModel.relatedQuery('tags').for(id).unrelate();

    // Prices
    await EquipmentObjectionModel.relatedQuery('prices').for(id).delete();

    return EquipmentObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentObjectionModel = (equipment: EquipmentObjectionModel): boolean => {
    if (!equipment) return false;

    if (!equipment.name) return false;

    if (equipment.prices && equipment.prices.some((x) => !validateEquipmentPriceObjectionModel(x))) return false;

    return true;
};

export const validateEquipmentPriceObjectionModel = (equipmentPrice: EquipmentPriceObjectionModel): boolean => {
    if (!equipmentPrice) return false;

    if (!equipmentPrice.name) return false;

    if (isNaN(equipmentPrice.pricePerHour) || equipmentPrice.pricePerHour < 0) return false;
    if (isNaN(equipmentPrice.pricePerUnit) || equipmentPrice.pricePerUnit < 0) return false;
    if (isNaN(equipmentPrice.pricePerHourTHS) || equipmentPrice.pricePerHourTHS < 0) return false;
    if (isNaN(equipmentPrice.pricePerUnitTHS) || equipmentPrice.pricePerUnitTHS < 0) return false;

    return true;
};
