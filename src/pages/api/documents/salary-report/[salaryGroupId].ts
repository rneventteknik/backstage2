import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSalaryReportDocument, getSalaryReportDocumentFileName } from '../../../../document-templates';
import { respondWithAccessDeniedResponse, respondWithEntityNotFoundResponse } from '../../../../lib/apiResponses';
import { fetchSalaryGroupWithSalaryInformation } from '../../../../lib/db-access/salaryGroup';
import { fetchSettings } from '../../../../lib/db-access/setting';
import { toSalaryGroup } from '../../../../lib/mappers/salaryGroup';
import { getSalaryReport } from '../../../../lib/pricingUtils';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { getGlobalSetting } from '../../../../lib/utils';
import { Role } from '../../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        if (context.currentUser.role != Role.ADMIN) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        if (isNaN(Number(req.query.salaryGroupId))) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const convertToNumberArray = (param: string | string[]) => {
            if (typeof param === 'string') {
                return [Number(param)];
            } else {
                return param.map((str) => Number(str));
            }
        };

        const bookingIds = req.query.bookingId ? convertToNumberArray(req.query.bookingId) : [];

        return fetchSalaryGroupWithSalaryInformation(Number(req.query.salaryGroupId))
            .then(async (result) => {
                if (!result) {
                    respondWithEntityNotFoundResponse(res);
                    return;
                }

                const salaryGroup = toSalaryGroup(result);
                const globalSettings = await fetchSettings();
                const rs = getGlobalSetting('salary.rs', globalSettings);
                const wageRatioExternal = Number(getGlobalSetting('salary.wageRatio.external', globalSettings));
                const wageRatioThs = Number(getGlobalSetting('salary.wageRatio.ths', globalSettings));

                if (!salaryGroup.bookings) {
                    throw new Error('Invalid salary group, booking parameter is necessary');
                }

                const salaryGroupWithFilteredBookings = {
                    ...salaryGroup,
                    bookings: salaryGroup.bookings.filter((x) => bookingIds.length === 0 || bookingIds.includes(x.id)),
                };
                const salaryReport = getSalaryReport(
                    salaryGroupWithFilteredBookings,
                    rs,
                    wageRatioExternal,
                    wageRatioThs,
                );

                const filename = getSalaryReportDocumentFileName(salaryReport);
                const stream = await renderToStream(getSalaryReportDocument(salaryReport));

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
