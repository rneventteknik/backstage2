import { BaseEntityWithName } from './BaseEntity';
import { Booking } from './Booking';
import { User } from './User';

export interface SalaryGroup extends BaseEntityWithName {
    bookings: Booking[];
    user: User;
}
