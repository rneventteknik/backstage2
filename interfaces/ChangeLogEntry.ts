namespace Backstage2.Models {
    export interface ChangeLogEntry {
        user: User;
        timestamp: Date;
        description: string;
    }
    export interface BookingChangelogEntry extends BaseEntity, ChangeLogEntry { }
    export interface EquipmentChangelogEntry extends BaseEntity, ChangeLogEntry { }
}