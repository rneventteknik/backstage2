import { Role } from '../enums/Role';

export interface CurrentUserInfo {
    isLoggedIn: boolean;
    username?: string;
    name?: string;
    role?: Role;
}
