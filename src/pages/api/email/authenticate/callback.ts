import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        res.status(405).json({ statusCode: 405, message: 'Method not allowed' });
        return;
    }

    const { code, error } = req.query;

    if (error) {
        res.status(400).json({
            statusCode: 400,
            message: 'Authentication was cancelled or failed',
            error: error,
        });
        return;
    }

    if (!code || typeof code !== 'string') {
        res.status(400).json({
            statusCode: 400,
            message: 'Missing authorization code',
        });
        return;
    }

    try {
        const clientId = process.env.GMAIL_CLIENT_ID;
        const clientSecret = process.env.GMAIL_CLIENT_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/authenticate/callback`;

        if (!clientId || !clientSecret) {
            res.status(500).json({
                statusCode: 500,
                message:
                    'Gmail OAuth credentials not configured. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables.',
            });
            return;
        }

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

        const { tokens } = await oauth2Client.getToken(code);

        res.status(200).json({
            statusCode: 200,
            message: 'Authentication successful',
            refreshToken: tokens.refresh_token,
            instructions:
                'Add the refresh token to your environment variables or .env.local file as GMAIL_REFRESH_TOKEN',
        });
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export default handler;
