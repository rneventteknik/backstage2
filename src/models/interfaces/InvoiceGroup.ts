import { BaseEntityWithName } from './BaseEntity';
import { Booking } from './Booking';
import { User } from './User';

export interface InvoiceGroup extends BaseEntityWithName {
    bookings?: Booking[];
    user?: User;
}
