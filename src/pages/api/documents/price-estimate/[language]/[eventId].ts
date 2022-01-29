import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import { getPriceEstimateDocument, getPriceEstimateDocumentFileName } from '../../../../../document-templates';
import { Language } from '../../../../../document-templates/useTextResources';
import { respondWithEntityNotFoundResponse } from '../../../../../lib/apiResponses';
import { fetchEvent } from '../../../../../lib/db-access';
import { toEvent } from '../../../../../lib/mappers/event';
import { withSessionContext } from '../../../../../lib/sessionContext';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
        if (isNaN(Number(req.query.eventId))) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        return fetchEvent(Number(req.query.eventId))
            .then(async (result) => {
                if (!result) {
                    respondWithEntityNotFoundResponse(res);
                    return;
                }

                const event = toEvent(result);
                const documentLanguage = req.query.language === 'en' ? Language.EN : Language.SV;
                const filename = getPriceEstimateDocumentFileName(event, documentLanguage);
                const stream = await renderToStream(getPriceEstimateDocument(event, documentLanguage));

                // If the download flag is set, tell the browser to download the file instead of showing it in a new tab.
                if (req.query.download) {
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                } else {
                    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
                }

                res.setHeader('Content-Type', 'application/pdf');
                stream.pipe(res);
            })
            .catch((err) => {
                throw err;
            });
    },
);

export default handler;
