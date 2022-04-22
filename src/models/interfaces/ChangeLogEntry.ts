import { BaseEntityWithName } from './BaseEntity';
import { User } from './User';

export interface ChangeLogEntry {
    user?: User;
    timestamp: Date;
    description: string;
}
export interface BookingChangelogEntry extends BaseEntityWithName, ChangeLogEntry {}
export interface EquipmentChangelogEntry extends BaseEntityWithName, ChangeLogEntry {}
