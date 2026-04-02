import { BaseEntityWithName } from './BaseEntity';
import currency from 'currency.js';

export interface BookingChangelogEntry extends BaseEntityWithName {
    equipmentPrice?: currency;
    timeEstimatePrice?: currency;
    timeReportsPrice?: currency | null;
    fixedPrice?: currency | null;
}
export type EquipmentChangelogEntry = BaseEntityWithName;
