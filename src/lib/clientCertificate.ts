import { timingSafeEqual } from 'crypto';
import { IncomingMessage } from 'http';

// Cloudflare terminates mTLS and forwards the result to us in a header set by a Transform Rule. Since the
// Heroku app is also reachable directly (bypassing Cloudflare), that header is only trusted when the request
// also carries the origin secret, which is set by the same Transform Rule.
const originSecretHeader = 'x-origin-secret';
const clientCertVerifiedHeader = 'cf-cert-verified';

const getHeader = (req: IncomingMessage, name: string): string | undefined => {
    console.log(req.headers);
    const value = req.headers[name];
    return Array.isArray(value) ? value[0] : value;
};

const isFromCloudflare = (req: IncomingMessage): boolean => {
    const expectedSecret = process.env.CF_ORIGIN_SECRET;
    const receivedSecret = getHeader(req, originSecretHeader);

    // Fail closed if the secret is not configured
    if (!expectedSecret || !receivedSecret) {
        return false;
    }

    const expected = Buffer.from(expectedSecret);
    const received = Buffer.from(receivedSecret);

    return expected.length === received.length && timingSafeEqual(expected, received);
};

export const hasVerifiedClientCertificate = (req: IncomingMessage): boolean => {
    // Local dev mock
    if (process.env.NODE_ENV !== 'production') {
        return true;
    }

    return isFromCloudflare(req) && getHeader(req, clientCertVerifiedHeader) == 'true';
};
