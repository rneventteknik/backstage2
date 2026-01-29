import {
    EquipmentObjectionModel,
    EquipmentPriceObjectionModel,
} from '../../models/objection-models/EquipmentObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { getPartialSearchStrings } from '../utils';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const searchEquipment = async (searchString: string, count: number): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const searchStrings = getPartialSearchStrings(searchString);

    return EquipmentObjectionModel.query()
        .where('isArchived', '<>', 1)
        .andWhere((builder) =>
            builder
                .where((innerBuilder) => {
                    searchStrings.forEach((partialSearchString) => {
                        innerBuilder.andWhere('name', getCaseInsensitiveComparisonKeyword(), partialSearchString);
                    });
                })
                .orWhere((innerBuilder) => {
                    searchStrings.forEach((partialSearchString) => {
                        innerBuilder.andWhere('nameEN', getCaseInsensitiveComparisonKeyword(), partialSearchString);
                    });
                })
                .orWhere((innerBuilder) => {
                    searchStrings.forEach((partialSearchString) => {
                        innerBuilder.andWhere(
                            'searchKeywords',
                            getCaseInsensitiveComparisonKeyword(),
                            partialSearchString,
                        );
                    });
                }),
        )
        .withGraphFetched('tags')
        .limit(count);
};

export const fetchEquipment = async (id: number): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.query()
        .where('id', id)
        .withGraphFetched('tags')
        .withGraphFetched('equipmentPublicCategory')
        .withGraphFetched('equipmentLocation')
        .withGraphFetched('prices')
        .withGraphFetched('changelog(changelogInfo)')
        .withGraphFetched('connectedEquipmentEntries.equipmentPrice')
        .withGraphFetched('connectedEquipmentEntries.connectedEquipment')
        .withGraphFetched('connectedEquipmentEntries.connectedEquipment.prices')
        .modifiers({
            changelogInfo: (builder) => {
                builder.orderBy('updated', 'desc').limit(250);
            },
        })
        .then((equipment) => equipment[0]);
};

export const fetchEquipments = async (fetchArchived = false): Promise<EquipmentObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    let query = EquipmentObjectionModel.query();

    if (fetchArchived) {
        query = query.where('isArchived', '<>', 0);
    } else {
        query = query.where('isArchived', '<>', 1);
    }

    return query
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
        .where('isArchived', '<>', 1)
        .select('id', 'name', 'nameEN', 'description', 'descriptionEN')
        .withGraphFetched('prices(publicPriceInfo)')
        .withGraphFetched('tags(publicTagInfo)')
        .withGraphFetched('equipmentPublicCategory(equipmentPublicCategoryInfo)')
        .modifiers({
            publicPriceInfo: (builder) => {
                builder.select('id', 'name', 'pricePerUnit', 'pricePerHour', 'pricePerUnitTHS', 'pricePerHourTHS');
            },

            publicTagInfo: (builder) => {
                builder.select('id', 'name', 'color', 'isPublic').where('isPublic', '1');
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

    return EquipmentObjectionModel.transaction(async (trx) => {
        const existingDatabaseModel = await EquipmentObjectionModel.query(trx)
            .findById(id)
            .orderBy('id')
            .withGraphFetched('tags')
            .withGraphFetched('prices');

        // Tags.
        if (equipment.tags) {
            const { toAdd: tagsToAdd, toDelete: tagsToDelete } = compareLists(
                equipment.tags,
                existingDatabaseModel?.tags,
            );

            tagsToAdd.map(async (x) => {
                await EquipmentObjectionModel.relatedQuery('tags', trx).for(id).relate(x.id);
            });

            tagsToDelete.map(async (x) => {
                await EquipmentObjectionModel.relatedQuery('tags', trx).for(id).findById(x.id).unrelate();
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
                await EquipmentObjectionModel.relatedQuery('prices', trx)
                    .for(id)
                    .insert(withCreatedDate(removeIdAndDates(x)));
            });

            pricesToDelete.map(async (x) => {
                await EquipmentPriceObjectionModel.query(trx).deleteById(x.id);
            });

            pricesToUpdate.map(async (x) => {
                await EquipmentPriceObjectionModel.query(trx).patchAndFetchById(
                    x.id,
                    withUpdatedDate(removeIdAndDates(x)),
                );
            });
        }

        return EquipmentObjectionModel.query(trx).patchAndFetchById(id, withUpdatedDate(removeIdAndDates(equipment)));
    });
};

export const insertEquipment = async (equipment: EquipmentObjectionModel): Promise<EquipmentObjectionModel> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.query().insert(withCreatedDate(removeIdAndDates(equipment)));
};

export const deleteEquipment = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return EquipmentObjectionModel.transaction(async (trx) => {
        // Tags
        await EquipmentObjectionModel.relatedQuery('tags', trx).for(id).unrelate();

        // Prices
        await EquipmentObjectionModel.relatedQuery('prices', trx).for(id).delete();

        return EquipmentObjectionModel.query(trx)
            .deleteById(id)
            .then((res) => res > 0);
    });
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
