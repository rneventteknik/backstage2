import { Role } from '../enums/Role';

export interface CurrentUserInfo {
    isLoggedIn: boolean;
    userId?: number;
    name?: string;
    role?: Role;
}
