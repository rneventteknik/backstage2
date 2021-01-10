namespace Backstage2.Models {
    export interface EquipmentPackage extends BaseEntity {
        nameEN: string;
        description: string;
        descriptionEN: string;
        note: string;
        imageUrl: string;
        publiclyHidden: boolean;
        categories: EquipmentCategory[];
        changeLog: EquipmentChangelogEntry;
        equipment: Equipment[];
    }
}
