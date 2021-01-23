namespace Backstage2.Models {
    export interface SalaryGroup extends BaseEntityWithName {
        events: Event[];
        user: User;
    }
}
