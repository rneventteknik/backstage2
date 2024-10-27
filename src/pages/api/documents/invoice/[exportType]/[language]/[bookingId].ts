import { NextApiRequest, NextApiResponse } from 'next';
import { getHogiaTxtInvoice } from '../../../../../../document-templates/txt/hogiaInvoice';
import { respondWithEntityNotFoundResponse } from '../../../../../../lib/apiResponses';
import { fetchBookingWithUser } from '../../../../../../lib/db-access/booking';
import { toBooking } from '../../../../../../lib/mappers/booking';
import { withSessionContext } from '../../../../../../lib/sessionContext';
import { getTextResource } from '../../../../../../document-templates/useTextResources';
import {
    getHogiaInvoiceFileName,
    getInvoiceDocument,
    getInvoiceDocumentFileName,
} from '../../../../../../document-templates';
import { Language } from '../../../../../../models/enums/Language';
import { toBookingViewModel } from '../../../../../../lib/datetimeUtils';
import { fetchSettings } from '../../../../../../lib/db-access/setting';
import { getGlobalSetting } from '../../../../../../lib/utils';
import { getInvoiceData } from '../../../../../../lib/pricingUtils';
import { getTextResourcesFromGlobalSettings } from '../../../../../../document-templates/utils';
import { renderToStream } from '@react-pdf/renderer';

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
        const filename =
            req.query.exportType === 'pdf'
                ? getInvoiceDocumentFileName(bookingViewModel)
                : getHogiaInvoiceFileName(bookingViewModel);

        const t = (key: string): string => {
            return getTextResource(key, documentLanguage, getTextResourcesFromGlobalSettings(globalSettings));
        };

        const globalSettings = await fetchSettings();

        const dimension1 = getGlobalSetting('invoice.dimension1', globalSettings);
        const ourReference = getGlobalSetting('invoice.ourReference', globalSettings);
        const templateName = getGlobalSetting('invoice.templateName', globalSettings);
        const documentName = getGlobalSetting('invoice.documentName', globalSettings);
        const defaultEquipmentAccountExternal = getGlobalSetting(
            'accounts.defaultEquipmentAccount.external',
            globalSettings,
        );
        const defaultEquipmentAccountInternal = getGlobalSetting(
            'accounts.defaultEquipmentAccount.internal',
            globalSettings,
        );
        const defaultSalaryAccountExternal = getGlobalSetting('accounts.defaultSalaryAccount.external', globalSettings);
        const defaultSalaryAccountInternal = getGlobalSetting('accounts.defaultSalaryAccount.internal', globalSettings);

        const invoiceData = getInvoiceData(
            bookingViewModel,
            dimension1,
            ourReference,
            templateName,
            documentName,
            defaultEquipmentAccountExternal,
            defaultEquipmentAccountInternal,
            defaultSalaryAccountExternal,
            defaultSalaryAccountInternal,
            t,
            documentLanguage === Language.EN ? 'en-SE' : 'sv-SE',
        );

        // If the download flag is set, tell the browser to download the file instead of showing it in a new tab.
        if (req.query.download) {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        } else {
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        }

        if (req.query.exportType === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            const stream = await renderToStream(getInvoiceDocument(invoiceData, documentLanguage, globalSettings));
            stream.pipe(res);
        } else {
            res.setHeader('Content-Type', 'text/plain; charset=windows-1252');
            const content = getHogiaTxtInvoice(invoiceData, t);
            res.send(content);
        }
    });
});

export default handler;
