import { BaseEntityWithName } from './BaseEntity';

export interface EquipmentPublicCategory extends BaseEntityWithName {
    description?: string;
    sortIndex?: number;
}
