import { BaseEntity } from './BaseEntity';

export interface UserCard extends BaseEntity {
    userId: number;
    cardName: string;
    hashedCardId?: string; // Usually not exposed in API responses
}
