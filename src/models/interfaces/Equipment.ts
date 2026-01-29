import { BaseEntity, BaseEntityWithName } from './BaseEntity';
import { EquipmentChangelogEntry } from './ChangeLogEntry';
import { EquipmentTag } from './EquipmentTag';
import { EquipmentPrice } from './EquipmentPrice';
import { Image } from './Image';
import { EquipmentPublicCategory } from './EquipmentPublicCategory';
import { EquipmentLocation } from './EquipmentLocation';

export interface Equipment extends BaseEntityWithName {
    inventoryCount: number | null;
    nameEN: string;
    description: string;
    descriptionEN: string;
    searchKeywords: string;
    note: string;
    image?: Image;
    publiclyHidden: boolean;
    isArchived: boolean;
    equipmentPublicCategory?: EquipmentPublicCategory;
    equipmentLocation?: EquipmentLocation;
    changelog: EquipmentChangelogEntry[];
    tags: EquipmentTag[];
    prices: EquipmentPrice[];
    connectedEquipmentEntries: ConnectedEquipmentEntry[];
}
export interface ConnectedEquipmentEntry extends BaseEntity {
    connectedEquipmentId: number;
    connectedEquipment?: Equipment;
    equipmentPriceId: number | null;
    equipmentPrice?: EquipmentPrice | null;
    sortIndex: number;
    isHidden: boolean;
    isFree: boolean;
}
