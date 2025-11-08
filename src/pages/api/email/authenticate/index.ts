import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        res.status(405).json({ statusCode: 405, message: 'Method not allowed' });
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

        const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent', // Force to get refresh token
        });

        // Redirect to Google's OAuth consent screen
        res.redirect(authUrl);
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Error initiating authentication',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export default handler;
