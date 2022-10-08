import {
    IBookingObjectionModel,
    IEquipmentObjectionModel,
    IUserObjectionModel,
    IEquipmentPackageObjectionModel,
    IEquipmentTagObjectionModel,
} from '../objection-models';

export interface SearchResult {
    bookings: IBookingObjectionModel[];
    equipment: IEquipmentObjectionModel[];
    users: IUserObjectionModel[];
}

export interface EquipmentSearchResult {
    equipment: IEquipmentObjectionModel[];
    equipmentPackages: IEquipmentPackageObjectionModel[];
    equipmentTags: IEquipmentTagObjectionModel[];
}

export interface BookingsSearchResult {
    bookings: IBookingObjectionModel[];
}
