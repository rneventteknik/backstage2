import { BaseEntityWithName } from './BaseEntity';

export interface EquipmentLocation extends BaseEntityWithName {
    description?: string;
    sortIndex: number;
}
