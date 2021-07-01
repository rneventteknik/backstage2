export interface UpdateAuthRequest {
    userId: number;
    username: string;
    password: string;
}

export interface UpdateAuthResponse {
    username: string;
}
