import { EquipmentApiModel, EquipmentPriceApiModel } from '../../interfaces/api-models/EquipmentApiModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchEquipment = async (searchString: string, count: number): Promise<EquipmentApiModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return EquipmentApiModel.query()
        .where('name', 'ilike', modifiedSearchString)
        .orWhere('nameEN', 'ilike', modifiedSearchString)
        .orderBy('updated', 'desc')
        .withGraphFetched('categories')
        .limit(count);
};

export const fetchEquipment = async (id: number): Promise<EquipmentApiModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentApiModel.query()
        .findById(id)
        .withGraphFetched('categories')
        .withGraphFetched('prices')
        .withGraphFetched('changeLog');
};

export const fetchEquipments = async (): Promise<EquipmentApiModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentApiModel.query().withGraphFetched('prices').withGraphFetched('categories');
};

export const updateEquipment = async (id: number, equipment: EquipmentApiModel): Promise<EquipmentApiModel> => {
    ensureDatabaseIsInitialized();

    // Categories. To keep it simple for now we delete all the old links and create new ones.
    if (equipment.categories) {
        await EquipmentApiModel.relatedQuery('categories').for(id).unrelate();

        equipment.categories.map(async (x) => {
            if (x.id) {
                await EquipmentApiModel.relatedQuery('categories').for(id).relate(x.id);
            }
        });
    }

    // Prices. To keep it simple for now we delete all the old prices and create new ones. Once we have
    // a client editor and are sending ids in the api we can improve this to only update whats needed.
    if (equipment.prices) {
        await EquipmentApiModel.relatedQuery('prices').for(id).delete();

        await EquipmentApiModel.relatedQuery('prices')
            .for(id)
            .insert(equipment.prices.map((x) => withCreatedDate(removeIdAndDates(x))));
    }

    return EquipmentApiModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(equipment)));
};

export const insertEquipment = async (equipment: EquipmentApiModel): Promise<EquipmentApiModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentApiModel.query().insert(withCreatedDate(removeIdAndDates(equipment)));
};

export const deleteEquipment = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    // Categories
    await EquipmentApiModel.relatedQuery('categories').for(id).unrelate();

    // Prices
    await EquipmentApiModel.relatedQuery('prices').for(id).delete();

    return EquipmentApiModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateEquipmentApiModel = (equipment: EquipmentApiModel): boolean => {
    if (!equipment) return false;

    if (!equipment.name) return false;

    if (equipment.prices && equipment.prices.some((x) => !validateEquipmentPriceApiModel(x))) return false;

    return true;
};

export const validateEquipmentPriceApiModel = (equipmentPrice: EquipmentPriceApiModel): boolean => {
    if (!equipmentPrice) return false;

    if (!equipmentPrice.name) return false;

    if (isNaN(equipmentPrice.pricePerHour)) return false;
    if (isNaN(equipmentPrice.pricePerUnit)) return false;
    if (isNaN(equipmentPrice.pricePerHourTHS)) return false;
    if (isNaN(equipmentPrice.pricePerUnitTHS)) return false;

    return true;
};
