import {
    EquipmentObjectionModel,
    EquipmentPriceObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

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

export const fetchEquipment = async (id: number): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.query()
        .findById(id)
        .withGraphFetched('tags')
        .withGraphFetched('equipmentPublicCategory')
        .withGraphFetched('prices')
        .withGraphFetched('changeLog');
};

export const fetchEquipments = async (): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentObjectionModel.query()
        .withGraphFetched('prices')
        .withGraphFetched('tags')
        .withGraphFetched('equipmentPublicCategory');
};

// This function fetches the events, but only with information that should be publicly available.
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

    // Tags. To keep it simple for now we delete all the old links and create new ones.
    if (equipment.tags) {
        await EquipmentObjectionModel.relatedQuery('tags').for(id).unrelate();

        equipment.tags.map(async (x) => {
            if (x.id) {
                await EquipmentObjectionModel.relatedQuery('tags').for(id).relate(x.id);
            }
        });
    }

    // Prices. To keep it simple for now we delete all the old prices and create new ones. Once we have
    // a client editor and are sending ids in the api we can improve this to only update whats needed.
    if (equipment.prices !== undefined) {
        await EquipmentObjectionModel.relatedQuery('prices').for(id).delete();

        if (equipment.prices.length > 0) {
            await EquipmentObjectionModel.relatedQuery('prices')
                .for(id)
                .insert(equipment.prices.map((x) => withCreatedDate(removeIdAndDates(x))));
        }
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

    if (isNaN(equipmentPrice.pricePerHour)) return false;
    if (isNaN(equipmentPrice.pricePerUnit)) return false;
    if (isNaN(equipmentPrice.pricePerHourTHS)) return false;
    if (isNaN(equipmentPrice.pricePerUnitTHS)) return false;

    return true;
};
