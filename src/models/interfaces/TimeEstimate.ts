import { BaseEntityWithName } from './BaseEntity';

export interface TimeEstimate extends BaseEntityWithName {
    numberOfHours: number;
    eventId: number;
    pricePerHour: number;
}
