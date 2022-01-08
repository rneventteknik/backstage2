import { BaseEntity, BaseEntityWithName } from './BaseEntity';
import { Equipment } from './Equipment';
import { EquipmentTag } from './EquipmentTag';

export interface EquipmentPackage extends BaseEntityWithName {
    note: string;
    imageId: number;
    estimatedHours: number;
    tags: EquipmentTag[];
    equipmentEntries: EquipmentPackageEntry[];
}

export interface EquipmentPackageEntry extends BaseEntity {
    equipment: Equipment;
    numberOfUnits: number;
}
