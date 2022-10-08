import { BaseEntityWithName } from './BaseEntity';
import { Equipment } from './Equipment';

export interface EquipmentTag extends BaseEntityWithName {
    color?: string;
    equipment: Equipment[];
}
