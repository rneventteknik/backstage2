/* eslint-disable @typescript-eslint/no-empty-interface */
import { BaseEntityWithName } from './BaseEntity';
import currency from 'currency.js';

export interface BookingChangelogEntry extends BaseEntityWithName {
    equipmentPrice?: currency;
    timeEstimatePrice?: currency;
    timeReportsPrice?: currency | null;
    fixedPrice?: currency | null;
}

export interface EquipmentChangelogEntry extends BaseEntityWithName {}
