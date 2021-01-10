namespace Backstage2.Models {
    export interface Equipment extends BaseEntity {
        inventoryCount: number;
        nameEN: string;
        description: string;
        descriptionEN: string;
        note: string;
        imageUrl: string;
        publiclyHidden: boolean;
        changeLog: EquipmentChangelogEntry;
        categories: EquipmentCategory[];
    }
}