import { NextApiResponse } from 'next';

export const accessDeniedResponse = { statusCode: 403, message: 'Access Denied' };
export const invalidMethodResponse = { statusCode: 405, message: 'Invalid HTTP Method' };
export const entityNotFoundResponse = { statusCode: 404, message: 'Entity Not Found' };
export const invalidDataResponse = { statusCode: 500, message: 'Invalid Data' };

export const respondWithAccessDeniedResponse = (res: NextApiResponse): void =>
    res.status(accessDeniedResponse.statusCode).json(accessDeniedResponse);

export const respondWithInvalidMethodResponse = (res: NextApiResponse): void =>
    res.status(invalidMethodResponse.statusCode).json(invalidMethodResponse);

export const respondWithEntityNotFoundResponse = (res: NextApiResponse): void =>
    res.status(entityNotFoundResponse.statusCode).json(entityNotFoundResponse);

export const respondWithInvalidDataResponse = (res: NextApiResponse): void =>
    res.status(invalidDataResponse.statusCode).json(invalidDataResponse);

export const respondWithCustomErrorMessage = (res: NextApiResponse, errorMessage: string): void =>
    res.status(500).json({ statusCode: 500, message: errorMessage });
