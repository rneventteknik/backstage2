import { BaseEntityWithName } from './BaseEntity';
import { MemberStatus } from './enums/MemberStatus';
import { Role } from './enums/Role';

export interface User extends BaseEntityWithName {
    role?: Role;
    memberStatus: MemberStatus;
    nameTag: string;
    phoneNumber: string;
    slackId: string;
    emailAddress: string;
    personalIdentityNumber?: string;
    bankName?: string;
    clearingNumber?: string;
    bankAccount?: string;
    homeAddress?: string;
    zipCode?: string;
    username?: string;
}
