import currency from 'currency.js';
import { BaseEntityWithName } from './BaseEntity';

export interface EquipmentPrice extends BaseEntityWithName {
    pricePerUnit: currency;
    pricePerHour: currency;
    pricePerUnitTHS: currency;
    pricePerHourTHS: currency;
}
