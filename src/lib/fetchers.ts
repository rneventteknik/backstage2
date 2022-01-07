import { toEquipment, toEquipmentCategory } from './mappers/equipment';
import { toEvent } from './mappers/event';
import { toUser } from './mappers/user';
import { getResponseContentOrError } from './utils';

// Since all fetchers follow the same pattern we have these two helper functions to
// generate a fetcher for a specified mapper.

function generateFetcher<T, S>(mapper: (apiModel: T) => S) {
    return (url: string) =>
        fetch(url)
            .then((response) => getResponseContentOrError<T>(response))
            .then(mapper);
}

function generateListFetcher<T, S>(mapper: (apiModel: T) => S) {
    return (url: string) =>
        fetch(url)
            .then((response) => getResponseContentOrError<T[]>(response))
            .then((objectionModel) => objectionModel.map((x) => mapper(x)));
}

export const equipmentFetcher = generateFetcher(toEquipment);
export const equipmentsFetcher = generateListFetcher(toEquipment);

export const equipmentCategoryFetcher = generateFetcher(toEquipmentCategory);
export const equipmentCategoriesFetcher = generateListFetcher(toEquipmentCategory);

export const eventFetcher = generateFetcher(toEvent);
export const eventsFetcher = generateListFetcher(toEvent);

export const userFetcher = generateFetcher(toUser);
export const usersFetcher = generateListFetcher(toUser);
