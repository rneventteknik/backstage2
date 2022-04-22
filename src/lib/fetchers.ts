import { toEquipment, toEquipmentPublicCategory, toEquipmentTag } from './mappers/equipment';
import { toEquipmentPackage } from './mappers/equipmentPackage';
import { toEquipmentList, toBooking } from './mappers/booking';
import { toUser } from './mappers/user';
import { toTimeReport } from './mappers/timeReport';
import { toTimeEstimate } from './mappers/timeEstimate';

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

export const equipmentPackageFetcher = generateFetcher(toEquipmentPackage);
export const equipmentPackagesFetcher = generateListFetcher(toEquipmentPackage);

export const equipmentTagFetcher = generateFetcher(toEquipmentTag);
export const equipmentTagsFetcher = generateListFetcher(toEquipmentTag);

export const equipmentPublicCategoryFetcher = generateFetcher(toEquipmentPublicCategory);
export const equipmentPublicCategoriesFetcher = generateListFetcher(toEquipmentPublicCategory);

export const equipmentListFetcher = generateFetcher(toEquipmentList);
export const equipmentListsFetcher = generateListFetcher(toEquipmentList);

export const bookingFetcher = generateFetcher(toBooking);
export const bookingsFetcher = generateListFetcher(toBooking);

export const userFetcher = generateFetcher(toUser);
export const usersFetcher = generateListFetcher(toUser);

export const timeReportFetcher = generateFetcher(toTimeReport);
export const timeReportsFetcher = generateListFetcher(toTimeReport);

export const timeEstimateFetcher = generateFetcher(toTimeEstimate);
export const timeEstimatesFetcher = generateListFetcher(toTimeEstimate);
