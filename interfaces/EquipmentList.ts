namespace Backstage2.Models {
    export interface EquipmentList extends BaseEntity {
        equipmentEntries: EquipmentListEntry[];
    }
    export interface EquipmentListEntry extends BaseEntity {
        equipment: Equipment;
    }
}