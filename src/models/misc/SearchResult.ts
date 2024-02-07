import {
    IBookingObjectionModel,
    IEquipmentObjectionModel,
    IUserObjectionModel,
    IEquipmentPackageObjectionModel,
    IEquipmentTagObjectionModel,
} from '../objection-models';
import { ICustomerObjectionModel } from '../objection-models/CustomerObjectionModel';

export interface SearchResult {
    bookings: IBookingObjectionModel[];
    equipment: IEquipmentObjectionModel[];
    equipmentPackage: IEquipmentPackageObjectionModel[];
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

export interface CustomersSearchResult {
    customers: ICustomerObjectionModel[];
}
