import currency from 'currency.js';
import { BaseEntityWithName } from './BaseEntity';
import { User } from './User';

export interface TimeReport extends BaseEntityWithName {
    userId: number;
    user?: User;
    actualWorkingHours: number;
    billableWorkingHours: number;
    startDatetime?: Date;
    endDatetime?: Date;
    pricePerHour: currency;
    bookingId: number;
    sortIndex: number;
}
