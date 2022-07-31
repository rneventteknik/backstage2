import { withApiSession } from '../../../../lib/session';
import { webcrypto } from 'crypto';
import { LoginToken } from '../../../../models/misc/LoginToken';
import { sealLoginToken } from '../../../../lib/authenticate';

const handler = withApiSession(async (req, res) => {
    const array = new BigUint64Array(1);
    const crypto = webcrypto as unknown as Crypto;
    const tokenId = crypto.getRandomValues(array)[0].toString(16);

    const token: LoginToken = {
        tokenId: tokenId,
        ip: req.socket.remoteAddress,
    };

    const sealedToken = await sealLoginToken(token);
    res.status(200).json({ token, sealedToken });

    return;
});

export default handler;
