namespace Backstage2.Models {
    export interface Equipment extends BaseEntityWithName {
        inventoryCount: number;
        nameEN: string;
        description: string;
        descriptionEN: string;
        note: string;
        image: Image;
        publiclyHidden: boolean;
        changeLog: EquipmentChangelogEntry;
        categories: EquipmentCategory[];
    }
}