import { IEquipmentObjectionModel } from '../objection-models';

export interface EquipmentImportExportModel extends IEquipmentObjectionModel {
    equipmentPublicCategoryName?: string;
    equipmentLocationName?: string;
    equipmentTagNames?: string[];
}
