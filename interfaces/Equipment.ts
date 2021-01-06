namespace Backstage2.Models {
    export interface Equipment extends BaseEntity {
        changeLog: EquipmentChangelogEntry;
        categories: EquipmentCategory[];
    }
}