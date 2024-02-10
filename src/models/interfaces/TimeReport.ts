import { BaseEntityWithName } from './BaseEntity';
import { User } from './User';

export interface TimeReport extends BaseEntityWithName {
    userId: number;
    user?: User;
    actualWorkingHours: number;
    billableWorkingHours: number;
    startDatetime?: Date;
    endDatetime?: Date;
    pricePerHour: number;
    bookingId: number;
    sortIndex: number;
}
