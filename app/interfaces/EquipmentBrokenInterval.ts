import { BaseEntityWithName } from "./BaseEntity";
import { Equipment } from "./Equipment";

export interface EquipmentBrokenInterval extends BaseEntityWithName {
    equipment: Equipment;
}
