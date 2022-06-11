import { BaseEntityWithName } from './BaseEntity';
import { EquipmentChangelogEntry } from './ChangeLogEntry';
import { EquipmentTag } from './EquipmentTag';
import { EquipmentPrice } from './EquipmentPrice';
import { Image } from './Image';
import { EquipmentPublicCategory } from './EquipmentPublicCategory';
import { EquipmentLocation } from './EquipmentLocation';

export interface Equipment extends BaseEntityWithName {
    inventoryCount: number;
    nameEN: string;
    description: string;
    descriptionEN: string;
    note: string;
    image?: Image;
    publiclyHidden: boolean;
    equipmentPublicCategory?: EquipmentPublicCategory;
    equipmentLocation?: EquipmentLocation;
    changeLog: EquipmentChangelogEntry[];
    tags: EquipmentTag[];
    prices: EquipmentPrice[];
}
