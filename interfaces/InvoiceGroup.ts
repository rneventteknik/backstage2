namespace Backstage2.Models {
    export interface InvoiceGroup extends BaseEntityWithName {
        events: Event[];
        user: User;
    }
}
