import { NextApiRequest, NextApiResponse } from 'next';
import { getHogiaTxtInvoice } from '../../../../../document-templates/txt/hogiaInvoice';
import { respondWithEntityNotFoundResponse } from '../../../../../lib/apiResponses';
import { fetchBookingWithUser } from '../../../../../lib/db-access/booking';
import { toBooking } from '../../../../../lib/mappers/booking';
import { withSessionContext } from '../../../../../lib/sessionContext';
import { getTextResource } from '../../../../../document-templates/useTextResources';
import { getHogiaInvoiceFileName } from '../../../../../document-templates';
import { Language } from '../../../../../models/enums/Language';
import { toBookingViewModel } from '../../../../../lib/datetimeUtils';
import { fetchSettings } from '../../../../../lib/db-access/setting';

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (isNaN(Number(req.query.bookingId))) {
        respondWithEntityNotFoundResponse(res);
        return;
    }

    return fetchBookingWithUser(Number(req.query.bookingId)).then(async (result) => {
        if (!result) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const booking = toBooking(result);
        const bookingViewModel = toBookingViewModel(booking);
        const documentLanguage = req.query.language === 'en' ? Language.EN : Language.SV;
        const filename = getHogiaInvoiceFileName(bookingViewModel);

        const t = (key: string): string => {
            return getTextResource(key, documentLanguage);
        };

        const globalSettings = await fetchSettings();

        res.setHeader('Content-Type', 'text/plain; charset=windows-1252');
        // If the download flag is set, tell the browser to download the file instead of showing it in a new tab.
        if (req.query.download) {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        } else {
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        }

        const content = getHogiaTxtInvoice(bookingViewModel, globalSettings, t);

        res.send(content);
    });
});

export default handler;
