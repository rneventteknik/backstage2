import { Model } from 'objection';
import { BaseObjectionModelWithName } from '.';
import { Language } from '../enums/Language';

export interface ICustomerObjectionModel extends BaseObjectionModelWithName {
    id: number;
    name: string;
    created?: string;
    updated?: string;
    pricePlan: number | null;
    accountKind: number | null;
    invoiceHogiaId: number | null;
    invoiceAddress: string | null;
    language: Language | null;
}

export class CustomerObjectionModel extends Model implements ICustomerObjectionModel {
    static tableName = 'Customer';

    id!: number;
    name!: string;
    created?: string;
    updated?: string;
    pricePlan!: number | null;
    accountKind!: number | null;
    invoiceHogiaId!: number | null;
    invoiceAddress!: string | null;
    language!: Language | null;
}
