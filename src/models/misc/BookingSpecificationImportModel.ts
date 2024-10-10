import { Equipment, EquipmentPrice } from '../interfaces';

export type BookingSpecificationEquipmentImportModel = {
    itemId: number;
    amount: number;
};

export type BookingSpecificationImportModel = {
    projectName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    description: string;
    startDate: string;
    endDate: string;
    equipment: BookingSpecificationEquipmentImportModel[];
    isThsMember: boolean;
};

export type BookingSpecificationEquipmentModel = {
    id: number;
    amount: number;
    equipment: Equipment;
    selectedPrice: EquipmentPrice | null;
    hours: number | null;
};

export type BookingSpecificationModel = {
    projectName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    description: string;
    startDate: string;
    endDate: string;
    equipment: BookingSpecificationEquipmentModel[];
    isThsMember: boolean;
};
