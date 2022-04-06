import { EquipmentPrice } from '.';
import { BaseEntityWithName } from './BaseEntity';
import { Equipment } from './Equipment';

export interface EquipmentList extends BaseEntityWithName {
    equipmentListEntries: EquipmentListEntry[];
    equipmentOutDatetime?: Date;
    equipmentInDatetime?: Date;
    usageStartDatetime?: Date;
    usageEndDatetime?: Date;
}

export interface EquipmentListEntry extends BaseEntityWithName {
    equipment?: Equipment;
    equipmentId?: number;
    name: string;
    nameEN: string;
    description: string;
    descriptionEN: string;

    numberOfUnits: number;
    numberOfHours: number;

    pricePerUnit: number;
    pricePerHour: number;
    equipmentPrice?: EquipmentPrice;
}
