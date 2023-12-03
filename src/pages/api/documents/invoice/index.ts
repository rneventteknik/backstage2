import { NextApiRequest, NextApiResponse } from 'next';
import { getHogiaTxtInvoice } from '../../../../document-templates/txt/hogiaInvoice';
import { fetchBookingWithUser } from '../../../../lib/db-access/booking';
import { toBooking } from '../../../../lib/mappers/booking';
import { withSessionContext } from '../../../../lib/sessionContext';
import { getTextResource } from '../../../../document-templates/useTextResources';
import archiver from 'archiver';
import { respondWithCustomErrorMessage, respondWithEntityNotFoundResponse } from '../../../../lib/apiResponses';
import {
    getHogiaInvoiceFileName,
    getInvoiceDocument,
    getInvoiceDocumentFileName,
} from '../../../../document-templates';
import { toBookingViewModel } from '../../../../lib/datetimeUtils';
import { fetchSettings } from '../../../../lib/db-access/setting';
import { getInvoiceData } from '../../../../lib/pricingUtils';
import { getGlobalSetting } from '../../../../lib/utils';
import { Language } from '../../../../models/enums/Language';
import { renderToStream } from '@react-pdf/renderer';
import { getTextResourcesFromGlobalSettings } from '../../../../document-templates/utils';

const getEncodedInvoices = async (id: number) => {
    return fetchBookingWithUser(id).then(async (result) => {
        if (!result) {
            throw 'Invalid booking';
        }

        const booking = toBooking(result);
        const bookingViewModel = toBookingViewModel(booking);

        const globalSettings = await fetchSettings();
        const t = (key: string): string => {
            return getTextResource(key, Language.SV, getTextResourcesFromGlobalSettings(globalSettings));
        };
        const dimension1 = getGlobalSetting('invoice.dimension1', globalSettings);
        const ourReference = getGlobalSetting('invoice.ourReference', globalSettings);
        const templateName = getGlobalSetting('invoice.templateName', globalSettings);
        const documentName = getGlobalSetting('invoice.documentName', globalSettings);
        const defaultEquipmentAccount = getGlobalSetting('accounts.defaultEquipmentAccount', globalSettings);
        const defaultSalaryAccountExternal = getGlobalSetting('accounts.defaultSalaryAccount.external', globalSettings);
        const defaultSalaryAccountInternal = getGlobalSetting('accounts.defaultSalaryAccount.internal', globalSettings);
        const locale = booking.language === Language.EN ? 'en-SE' : 'sv-SE';

        const invoiceData = getInvoiceData(
            bookingViewModel,
            dimension1,
            ourReference,
            templateName,
            documentName,
            defaultEquipmentAccount,
            defaultSalaryAccountExternal,
            defaultSalaryAccountInternal,
            t,
            locale,
        );

        const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => {
            return new Promise<Buffer>((resolve, reject) => {
                const _buf = Array<Uint8Array>();
                stream.on('data', (chunk) => _buf.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(_buf)));
                stream.on('error', (err) => reject(`error converting stream - ${err}`));
            });
        };

        return [
            {
                filecontent: await streamToBuffer(
                    await renderToStream(getInvoiceDocument(invoiceData, Language.SV, globalSettings)),
                ),
                filename: getInvoiceDocumentFileName(invoiceData),
            },
            {
                filecontent: getHogiaTxtInvoice(invoiceData, t),
                filename: getHogiaInvoiceFileName(booking),
            },
        ];
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

    return Promise.all(bookingIds.map((id) => getEncodedInvoices(id)))
        .then((responses) => {
            const zip = archiver('zip');
            res.setHeader('Content-Disposition', `attachment; filename="fakturor.zip"`);
            zip.pipe(res);

            responses.flat().map((response) => {
                zip.append(response.filecontent, { name: response.filename });
            });

            zip.finalize();
        })
        .catch((error) => {
            respondWithCustomErrorMessage(res, error);
        });
});

export default handler;
