import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    getRentalConfirmationDocument,
    getRentalConfirmationDocumentFileName,
} from '../../../../../document-templates';
import { respondWithEntityNotFoundResponse } from '../../../../../lib/apiResponses';
import { fetchBookingWithEquipmentLists } from '../../../../../lib/db-access/booking';
import { fetchSettings } from '../../../../../lib/db-access/setting';
import { toBooking } from '../../../../../lib/mappers/booking';
import { withSessionContext } from '../../../../../lib/sessionContext';
import { Language } from '../../../../../models/enums/Language';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (isNaN(Number(req.query.bookingId))) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    return fetchBookingWithEquipmentLists(Number(req.query.bookingId))
        .then(async (result) => {
            if (!result) {
                respondWithEntityNotFoundResponse(res);
                return;
            }

            const booking = toBooking(result);
            const globalSettings = await fetchSettings();
            const documentLanguage = req.query.language === 'en' ? Language.EN : Language.SV;
            const filename = getRentalConfirmationDocumentFileName(booking, documentLanguage);
            const stream = await renderToStream(
                getRentalConfirmationDocument(booking, documentLanguage, globalSettings),
            );

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
});

export default handler;
