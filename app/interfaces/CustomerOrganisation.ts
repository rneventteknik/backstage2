import { BaseEntityWithName } from "./BaseEntity";
import { AccountKind } from "./enums/AccountKind";
import { PricePlan } from "./enums/PricePlan";

export interface CustomerOrganisation extends BaseEntityWithName {
    invoiceHoogiaId: number;
    invoiceAddress: string;
    invoiceTag: string;
    pricePlan: PricePlan;
    accountKind: AccountKind;
}
