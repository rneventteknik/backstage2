export interface LoginTokenWrapper {
    token: LoginToken;
    sealedToken: string;
}

export interface LoginToken {
    tokenId: string;
    ip?: string;
}
