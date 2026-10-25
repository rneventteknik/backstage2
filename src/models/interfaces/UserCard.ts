import { BaseEntity } from './BaseEntity';

export interface UserCard extends BaseEntity {
    userId: number;
    cardName: string;
    hashedCardId?: string; // Should not be exposed in API responses
}
