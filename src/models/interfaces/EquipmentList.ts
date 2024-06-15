import currency from 'currency.js';
import { EquipmentPrice } from '.';
import { RentalStatus } from '../enums/RentalStatus';
import { BaseEntityWithName } from './BaseEntity';
import { Equipment } from './Equipment';

export interface EquipmentList extends BaseEntityWithName {
    sortIndex: number;
    listEntries: EquipmentListEntry[];
    listHeadings: EquipmentListHeading[];
    equipmentOutDatetime?: Date | null;
    equipmentInDatetime?: Date | null;
    usageStartDatetime?: Date | null;
    usageEndDatetime?: Date | null;
    numberOfDays?: number | null;
    rentalStatus?: RentalStatus | null;
}

export interface EquipmentListHeading extends BaseEntityWithName {
    sortIndex: number;
    name: string;
    description: string;

    listEntries: EquipmentListEntry[];

    equipmentListId?: number;
}
export interface EquipmentListEntry extends BaseEntityWithName {
    sortIndex: number;
    equipment?: Equipment | null;
    equipmentId?: number | null;
    name: string;
    description: string;

    numberOfUnits: number;
    numberOfHours: number;

    pricePerUnit: currency;
    pricePerHour: currency;
    equipmentPrice?: EquipmentPrice | null;
    discount: currency;
    isHidden: boolean;
    account: string | null;

    equipmentListId?: number | null;
    equipmentListHeadingId?: number | null;
}
