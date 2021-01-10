namespace Backstage2.Models {
    export interface CustomerOrganisation extends BaseEntity {
        invoiceHoogiaId: number;
        invoiceAddress: string;
        invoiceTag: string;
        pricePlan: PricePlan;
        accountKind: AccountKind;
    }
}