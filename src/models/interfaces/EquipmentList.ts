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
    equipment?: Equipment;
    equipmentId?: number;
    name: string;
    description: string;

    numberOfUnits: number;
    numberOfHours: number;

    pricePerUnit: number;
    pricePerHour: number;
    equipmentPrice?: EquipmentPrice;
    discount: number;
    isHidden: boolean;
    account: string | null;

    equipmentListId?: number | null;
    equipmentListHeadingId?: number | null;
}
