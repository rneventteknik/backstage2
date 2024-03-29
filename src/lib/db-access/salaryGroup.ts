import Objection from 'objection';
import { SalaryGroupObjectionModel } from '../../models/objection-models/SalaryGroupObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchSalaryGroup = async (
    id: number,
    trx?: Objection.Transaction,
): Promise<SalaryGroupObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return SalaryGroupObjectionModel.query(trx)
        .findById(id)
        .withGraphFetched('user')
        .withGraphFetched('bookings')
        .withGraphFetched('bookings.ownerUser')
        .withGraphFetched('bookings.equipmentLists.listEntries')
        .withGraphFetched('bookings.equipmentLists.listHeadings.listEntries');
};

export const fetchSalaryGroupWithSalaryInformation = async (
    id: number,
    trx?: Objection.Transaction,
): Promise<SalaryGroupObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return SalaryGroupObjectionModel.query(trx)
        .findById(id)
        .withGraphFetched('user')
        .withGraphFetched('bookings')
        .withGraphFetched('bookings.ownerUser')
        .withGraphFetched('bookings.timeReports.user(selectPersonalInformation)')
        .modifiers({
            selectPersonalInformation(builder) {
                builder.select('personalIdentityNumber', 'bankName', 'clearingNumber', 'bankAccount', 'homeAddress');
            },
        });
};

export const fetchSalaryGroups = async (): Promise<SalaryGroupObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return SalaryGroupObjectionModel.query()
        .withGraphFetched('user')
        .withGraphFetched('bookings.equipmentLists')
        .withGraphFetched('bookings.equipmentLists.listEntries')
        .withGraphFetched('bookings.equipmentLists.listHeadings.listEntries');
};

export const updateSalaryGroup = async (
    id: number,
    salaryGroup: SalaryGroupObjectionModel,
): Promise<SalaryGroupObjectionModel> => {
    ensureDatabaseIsInitialized();

    return SalaryGroupObjectionModel.transaction(async (trx) => {
        const existingDatabaseModel = await SalaryGroupObjectionModel.query(trx)
            .findById(id)
            .orderBy('id')
            .withGraphFetched('user')
            .withGraphFetched('bookings');

        // Bookings.
        if (salaryGroup.bookings) {
            const { toAdd: bookingsToAdd, toDelete: bookingsToDelete } = compareLists(
                salaryGroup.bookings,
                existingDatabaseModel?.bookings,
            );

            bookingsToAdd.map(async (x) => {
                await SalaryGroupObjectionModel.relatedQuery('bookings', trx).for(id).relate(x.id);
            });

            bookingsToDelete.map(async (x) => {
                await SalaryGroupObjectionModel.relatedQuery('bookings', trx).for(id).findById(x.id).unrelate();
            });
        }

        await SalaryGroupObjectionModel.query(trx).patchAndFetchById(
            id,
            withUpdatedDate(removeIdAndDates(salaryGroup)),
        );

        const updatedSalaryGroup = await fetchSalaryGroup(id, trx);

        if (!updatedSalaryGroup) {
            throw new Error('Invalid DB state');
        }

        return updatedSalaryGroup;
    });
};

export const insertSalaryGroup = async (salaryGroup: SalaryGroupObjectionModel): Promise<SalaryGroupObjectionModel> => {
    ensureDatabaseIsInitialized();
    return SalaryGroupObjectionModel.transaction(async (trx) => {
        const res = await SalaryGroupObjectionModel.query(trx).insert(withCreatedDate(removeIdAndDates(salaryGroup)));

        // Bookings.
        if (salaryGroup.bookings) {
            salaryGroup.bookings.map(async (x) => {
                await SalaryGroupObjectionModel.relatedQuery('bookings', trx).for(res.id).relate(x.id);
            });
        }

        const newSalaryGroup = await fetchSalaryGroup(res.id, trx);

        if (!newSalaryGroup) {
            throw new Error('Invalid DB state');
        }

        return newSalaryGroup;
    });
};

export const deleteSalaryGroup = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();
    return SalaryGroupObjectionModel.transaction(async (trx) => {
        // Bookings
        await SalaryGroupObjectionModel.relatedQuery('bookings', trx).for(id).unrelate();

        return SalaryGroupObjectionModel.query(trx)
            .deleteById(id)
            .then((res) => res > 0);
    });
};

export const validateSalaryGroupObjectionModel = (salaryGroup: SalaryGroupObjectionModel): boolean => {
    if (!salaryGroup) return false;

    if (!salaryGroup.name) return false;

    return true;
};
