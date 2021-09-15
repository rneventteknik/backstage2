import { BaseEntityWithName } from './BaseEntity';

export interface EquipmentPrice extends BaseEntityWithName {
    pricePerUnit: number;
    pricePerHour: number;
    pricePerUnitTHS: number;
    pricePerHourTHS: number;
}
