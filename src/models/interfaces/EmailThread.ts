import { BaseEntity } from './BaseEntity';

export interface EmailThread extends BaseEntity {
    bookingId: number;
    threadId: string;
}
