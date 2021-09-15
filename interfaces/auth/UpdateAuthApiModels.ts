import { Role } from '../enums/Role';

export interface UpdateAuthRequest {
    userId: number;
    role: Role;
    username: string;
    password: string;
}

export interface UpdateAuthResponse {
    username: string;
}
