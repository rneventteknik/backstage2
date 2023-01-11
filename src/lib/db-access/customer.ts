import { CustomerObjectionModel } from '../../models/objection-models/CustomerObjectionModel';
import { ensureDatabaseIsInitialized, getCaseInsensitiveComparisonKeyword } from '../database';
import { getPartialSearchStrings } from '../utils';
import { withCreatedDate, removeIdAndDates, withUpdatedDate } from './utils';

export const fetchCustomers = async (): Promise<CustomerObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return CustomerObjectionModel.query();
};

export const fetchCustomer = async (id: number): Promise<CustomerObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return CustomerObjectionModel.query().findById(id);
};

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

export const insertCustomer = async (customer: CustomerObjectionModel): Promise<CustomerObjectionModel> => {
    ensureDatabaseIsInitialized();

    return CustomerObjectionModel.query().insert(withCreatedDate(removeIdAndDates(customer)));
};

export const updateCustomer = async (id: number, Customer: CustomerObjectionModel): Promise<CustomerObjectionModel> => {
    ensureDatabaseIsInitialized();

    return CustomerObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(Customer)));
};

export const deleteCustomer = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return CustomerObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateCustomerObjectionModel = (customer: CustomerObjectionModel): boolean => {
    if (!customer) return false;
    if (!customer.name) return false;

    return true;
};
