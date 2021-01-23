namespace Backstage2.Models {
    export interface EquipmentList extends BaseEntityWithName {
        equipmentEntries: EquipmentListEntry[];
        equipmentOutDatetime: Date;
        equipmentInDatetime: Date;
        usageStartDatetime: Date;
        usageEndDatetime: Date;
    }

    export interface EquipmentListEntry extends BaseEntityWithName {
        children: EquipmentListEntry[];
        equipment: Equipment;
        package: EquipmentPackage;
        amount: number;
        nameEN: string;
        description: string;
        descriptionEN: string;
    }
}