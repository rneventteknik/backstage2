import { BaseEntityWithName } from './BaseEntity';
import { AccountKind } from '../enums/AccountKind';
import { User } from './User';

export interface TimeReport extends BaseEntityWithName {
    userId: number;
    user?: User;
    actualWorkingHours: number;
    billableWorkingHours: number;
    startDatetime?: Date;
    endDatetime?: Date;
    pricePerHour: number;
    accountKind: AccountKind;
    eventId: number;
}
