import { BaseEntityWithName } from './BaseEntity';
import { User } from './User';

export interface InvoiceGroup extends BaseEntityWithName {
    events: Event[];
    user: User;
}
