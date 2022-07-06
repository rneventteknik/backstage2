import { EquipmentPrice } from '.';
import { RentalStatus } from '../enums/RentalStatus';
import { BaseEntityWithName } from './BaseEntity';
import { Equipment } from './Equipment';

export interface EquipmentList extends BaseEntityWithName {
    sortIndex: number;
    equipmentListEntries: EquipmentListEntry[];
    equipmentOutDatetime?: Date;
    equipmentInDatetime?: Date;
    usageStartDatetime?: Date;
    usageEndDatetime?: Date;
    rentalStatus?: RentalStatus | null;
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
}
