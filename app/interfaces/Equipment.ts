import { BaseEntityWithName } from "./BaseEntity";
import { EquipmentChangelogEntry } from "./ChangeLogEntry";
import { EquipmentCategory } from "./EquipmentCategory";
import { Image } from "./Image";

export interface Equipment extends BaseEntityWithName {
    inventoryCount: number;
    nameEN: string;
    description: string;
    descriptionEN: string;
    note: string;
    image: Image;
    publiclyHidden: boolean;
    changeLog: EquipmentChangelogEntry;
    categories: EquipmentCategory[];
}
