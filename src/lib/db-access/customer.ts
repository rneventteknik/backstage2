import { CustomerObjectionModel } from '../../models/objection-models/CustomerObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { getPartialSearchStrings } from '../utils';

export const searchCustomers = async (searchString: string, count: number): Promise<CustomerObjectionModel[]> => {
    ensureDatabaseIsInitialized();

    const searchStrings = getPartialSearchStrings(searchString);

    return CustomerObjectionModel.query()
        .where((builder) => {
            searchStrings.forEach((partialSearchString) => {
                builder.andWhere('name', getCaseInsensitiveComparisonKeyword(), partialSearchString);
            });
        })
        .orderBy('updated', 'desc')
        .limit(count);
};
