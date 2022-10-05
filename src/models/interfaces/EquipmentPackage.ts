import { BaseEntity, BaseEntityWithName } from './BaseEntity';
import { Equipment } from './Equipment';
import { Image } from './Image';
import { EquipmentTag } from './EquipmentTag';

export interface EquipmentPackage extends BaseEntityWithName {
    note: string;
    image?: Image;
    estimatedHours: number;
    tags: EquipmentTag[];
    equipmentEntries: EquipmentPackageEntry[];
    nameEN?: string;
    description?: string;
    descriptionEN?: string;
    addAsHeading: boolean;
}

export interface EquipmentPackageEntry extends BaseEntity {
    equipmentId: number;
    equipment?: Equipment;
    numberOfUnits: number;
    isHidden: boolean;
    isFree: boolean;
}
