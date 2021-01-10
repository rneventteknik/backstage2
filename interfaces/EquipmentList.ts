namespace Backstage2.Models {
    export interface EquipmentList extends BaseEntity {
        equipmentEntries: EquipmentListEntry[];
        equipmentOutDatetime: Date;
        equipmentInDatetime: Date;
        usageStartDatetime: Date;
        usageEndDatetime: Date;
    }
    export interface EquipmentListEntry extends BaseEntity {
        children: EquipmentListEntry[];
        equipment: Equipment;
        package: EquipmentPackage;
        amount: number;
        nameEN: string;
        description: string;
        descriptionEN: string;
    }
}