namespace Backstage2.Models {
    export interface EquipmentPackage extends BaseEntity {
        changeLog: EquipmentChangelogEntry;
        equipment: Equipment[];
    }
}
