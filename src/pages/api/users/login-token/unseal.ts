import { unsealLoginToken } from '../../../../lib/authenticate';
import { withApiSession } from '../../../../lib/session';

const handler = withApiSession(async (req, res) => {
    const sealedToken = Array.isArray(req.query.sealedToken) ? req.query.sealedToken[0] : req.query.sealedToken ?? '';
    const token = await unsealLoginToken(sealedToken);
    res.status(200).json(token);

    return;
});

export default handler;
