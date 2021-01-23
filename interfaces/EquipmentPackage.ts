namespace Backstage2.Models {
    export interface EquipmentPackage extends BaseEntityWithName {
        note: string;
        imageId: number;
        estimatedHours: number;
        categories: EquipmentCategory[];
        equipmentEntries: EquipmentPackageEntry[];
    }

    export interface EquipmentPackageEntry extends BaseEntity {
        equipment: Equipment;
        numberOfUnits: number;
    }
}
