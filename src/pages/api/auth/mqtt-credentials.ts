import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithInvalidMethodResponse } from '../../../lib/apiResponses';
import { withSessionContext } from '../../../lib/sessionContext';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    switch (req.method) {
        case 'GET':
            const mqttCredentials = {
                username: process.env.MQTT_BROKER_USERNAME,
                password: process.env.MQTT_BROKER_PASSWORD,
            };
            res.status(200).json(mqttCredentials);
            break;

        default:
            respondWithInvalidMethodResponse(res);
    }
    return;
});

export default handler;
