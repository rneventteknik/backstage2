import { BaseEntity, BaseEntityWithName } from "./BaseEntity";
import { Equipment } from "./Equipment";
import { EquipmentCategory } from "./EquipmentCategory";


export interface EquipmentPackage extends BaseEntityWithName {
    note: string;
    imageId: number;
    estimatedHours: number;
    categories: EquipmentCategory[];
    equipmentEntries: EquipmentPackageEntry[];
}

export interface EquipmentPackageEntry extends BaseEntity {
    equipment: Equipment;
    numberOfUnits: number;
}
