import {
    IBookingObjectionModel,
    IEquipmentObjectionModel,
    IUserObjectionModel,
    IEquipmentPackageObjectionModel,
} from '../objection-models';

export interface SearchResult {
    bookings: IBookingObjectionModel[];
    equipment: IEquipmentObjectionModel[];
    users: IUserObjectionModel[];
}

export interface EquipmentSearchResult {
    equipment: IEquipmentObjectionModel[];
    equipmentPackages: IEquipmentPackageObjectionModel[];
}
