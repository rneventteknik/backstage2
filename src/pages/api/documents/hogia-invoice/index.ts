import { NextApiRequest, NextApiResponse } from 'next';
import { getHogiaTxtInvoice } from '../../../../document-templates/txt/hogiaInvoice';
import { fetchBookingWithUser } from '../../../../lib/db-access/booking';
import { toBooking } from '../../../../lib/mappers/booking';
import { withSessionContext } from '../../../../lib/sessionContext';
import { getTextResource } from '../../../../document-templates/useTextResources';
import archiver from 'archiver';
import { respondWithCustomErrorMessage, respondWithEntityNotFoundResponse } from '../../../../lib/apiResponses';
import { getHogiaInvoiceFileName } from '../../../../document-templates';
import { toBookingViewModel } from '../../../../lib/utils';

const getEncodedHogiaInvoice = async (id: number) => {
    return fetchBookingWithUser(id).then(async (result) => {
        if (!result) {
            throw 'Invalid booking';
        }

        const booking = toBooking(result);
        const bookingViewModel = toBookingViewModel(booking);

        const t = (key: string): string => {
            return getTextResource(key, booking.language);
        };

        const content = getHogiaTxtInvoice(bookingViewModel, t);

        return {
            filecontent: content,
            filename: getHogiaInvoiceFileName(booking),
        };
    });
};

const convertToNumberArray = (param: string | string[]) => {
    if (typeof param === 'string') {
        return [Number(param)];
    } else {
        return param.map((str) => Number(str));
    }
};

const handler = withSessionContext(async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (!req.query.bookingId) {
        respondWithEntityNotFoundResponse(res);
        return;
    }
    const bookingIds = convertToNumberArray(req.query.bookingId);

    return Promise.all(bookingIds.map((id) => getEncodedHogiaInvoice(id)))
        .then((responses) => {
            const zip = archiver('zip');
            res.setHeader('Content-Disposition', `attachment; filename="fakturor.zip"`);
            zip.pipe(res);

            responses.map((response) => {
                zip.append(response.filecontent, { name: response.filename });
            });

            zip.finalize();
        })
        .catch((error) => {
            respondWithCustomErrorMessage(res, error);
        });
});

export default handler;
