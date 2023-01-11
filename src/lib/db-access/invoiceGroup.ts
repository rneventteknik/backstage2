import Objection from 'objection';
import { InvoiceGroupObjectionModel } from '../../models/objection-models/InvoiceGroupObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { compareLists, removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchInvoiceGroup = async (
    id: number,
    trx?: Objection.Transaction,
): Promise<InvoiceGroupObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();

    return InvoiceGroupObjectionModel.query(trx)
        .findById(id)
        .withGraphFetched('user')
        .withGraphFetched('bookings.equipmentLists.listEntries')
        .withGraphFetched('bookings.equipmentLists.listHeadings.listEntries');
};

export const fetchInvoiceGroups = async (): Promise<InvoiceGroupObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return InvoiceGroupObjectionModel.query()
        .withGraphFetched('user')
        .withGraphFetched('bookings.equipmentLists')
        .withGraphFetched('bookings.equipmentLists.listEntries')
        .withGraphFetched('bookings.equipmentLists.listHeadings.listEntries');
};

export const updateInvoiceGroup = async (
    id: number,
    invoiceGroup: InvoiceGroupObjectionModel,
): Promise<InvoiceGroupObjectionModel> => {
    ensureDatabaseIsInitialized();

    return InvoiceGroupObjectionModel.transaction(async (trx) => {
        const existingDatabaseModel = await InvoiceGroupObjectionModel.query(trx)
            .findById(id)
            .orderBy('id')
            .withGraphFetched('user')
            .withGraphFetched('bookings');

        // Bookings.
        if (invoiceGroup.bookings) {
            const { toAdd: bookingsToAdd, toDelete: bookingsToDelete } = compareLists(
                invoiceGroup.bookings,
                existingDatabaseModel?.bookings,
            );

            bookingsToAdd.map(async (x) => {
                await InvoiceGroupObjectionModel.relatedQuery('bookings', trx).for(id).relate(x.id);
            });

            bookingsToDelete.map(async (x) => {
                await InvoiceGroupObjectionModel.relatedQuery('bookings', trx).for(id).findById(x.id).unrelate();
            });
        }

        await InvoiceGroupObjectionModel.query(trx).patchAndFetchById(
            id,
            withUpdatedDate(removeIdAndDates(invoiceGroup)),
        );

        const updatedInvoiceGroup = await fetchInvoiceGroup(id, trx);

        if (!updatedInvoiceGroup) {
            throw new Error('Invalid DB state');
        }

        return updatedInvoiceGroup;
    });
};

export const insertInvoiceGroup = async (
    invoiceGroup: InvoiceGroupObjectionModel,
): Promise<InvoiceGroupObjectionModel> => {
    ensureDatabaseIsInitialized();
    return InvoiceGroupObjectionModel.transaction(async (trx) => {
        const res = await InvoiceGroupObjectionModel.query(trx).insert(withCreatedDate(removeIdAndDates(invoiceGroup)));

        // Bookings.
        if (invoiceGroup.bookings) {
            invoiceGroup.bookings.map(async (x) => {
                await InvoiceGroupObjectionModel.relatedQuery('bookings', trx).for(res.id).relate(x.id);
            });
        }

        const newInvoiceGroup = await fetchInvoiceGroup(res.id, trx);

        if (!newInvoiceGroup) {
            throw new Error('Invalid DB state');
        }

        return newInvoiceGroup;
    });
};

export const deleteInvoiceGroup = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();
    return InvoiceGroupObjectionModel.transaction(async (trx) => {
        // Bookings
        await InvoiceGroupObjectionModel.relatedQuery('bookings', trx).for(id).unrelate();

        return InvoiceGroupObjectionModel.query(trx)
            .deleteById(id)
            .then((res) => res > 0);
    });
};

export const validateInvoiceGroupObjectionModel = (invoiceGroup: InvoiceGroupObjectionModel): boolean => {
    if (!invoiceGroup) return false;

    if (!invoiceGroup.name) return false;

    return true;
};
