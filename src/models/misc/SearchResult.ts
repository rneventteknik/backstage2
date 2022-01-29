import {
    IEventObjectionModel,
    IEquipmentObjectionModel,
    IUserObjectionModel,
    IEquipmentPackageObjectionModel,
} from '../objection-models';

export interface SearchResult {
    events: IEventObjectionModel[];
    equipment: IEquipmentObjectionModel[];
    users: IUserObjectionModel[];
}

export interface EquipmentSearchResult {
    equipment: IEquipmentObjectionModel[];
    equipmentPackages: IEquipmentPackageObjectionModel[];
}
