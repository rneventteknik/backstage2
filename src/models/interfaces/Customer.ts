import { BaseEntityWithName } from './BaseEntity';
import { AccountKind } from '../enums/AccountKind';
import { PricePlan } from '../enums/PricePlan';
import { Language } from '../enums/Language';

export interface Customer extends BaseEntityWithName {
    pricePlan: PricePlan | null;
    accountKind: AccountKind | null;
    invoiceHogiaId: number | null;
    invoiceAddress: string | null;
    language: Language | null;
}
