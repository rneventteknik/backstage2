import {
    EquipmentObjectionModel,
    EquipmentPriceObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchEquipment = async (searchString: string, count: number): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const modifiedSearchString = '%' + searchString + '%';

    return EquipmentObjectionModel.query()
        .where('name', 'ilike', modifiedSearchString)
        .orWhere('nameEN', 'ilike', modifiedSearchString)
        .orderBy('updated', 'desc')
        .withGraphFetched('categories')
        .limit(count);
};

export const fetchEquipment = async (id: number): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.query()
        .findById(id)
        .withGraphFetched('categories')
        .withGraphFetched('prices')
        .withGraphFetched('changeLog');
};

export const fetchEquipments = async (): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return EquipmentObjectionModel.query().withGraphFetched('prices').withGraphFetched('categories');
};

export const updateEquipment = async (
    id: number,
    equipment: EquipmentObjectionModel,
): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    // Categories. To keep it simple for now we delete all the old links and create new ones.
    if (equipment.categories) {
        await EquipmentObjectionModel.relatedQuery('categories').for(id).unrelate();

        equipment.categories.map(async (x) => {
            if (x.id) {
                await EquipmentObjectionModel.relatedQuery('categories').for(id).relate(x.id);
            }
        });
    }

    // Prices. To keep it simple for now we delete all the old prices and create new ones. Once we have
    // a client editor and are sending ids in the api we can improve this to only update whats needed.
    if (equipment.prices) {
        await EquipmentObjectionModel.relatedQuery('prices').for(id).delete();

        await EquipmentObjectionModel.relatedQuery('prices')
            .for(id)
            .insert(equipment.prices.map((x) => withCreatedDate(removeIdAndDates(x))));
    }

    return EquipmentObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(equipment)));
};

export const insertEquipment = async (equipment: EquipmentObjectionModel): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.query().insert(withCreatedDate(removeIdAndDates(equipment)));
};

export const deleteEquipment = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    // Categories
    await EquipmentObjectionModel.relatedQuery('categories').for(id).unrelate();

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
