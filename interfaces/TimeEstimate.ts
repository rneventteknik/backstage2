namespace Backstage2.Models {
    export interface TimeEstimate extends BaseEntityWithName {
        numberOfHours: number;
        pricePerHour: number;
    }
}