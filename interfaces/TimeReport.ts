namespace Backstage2.Models {
    export interface TimeReport extends BaseEntityWithName {
        user: User;
        actualWorkingHours: number;
        billableWorkingHours: number;
        StartDatetime: Date
        EndDatetime: Date
        PricePerHour: number;
        AccountKind: AccountKind;
    }
}
