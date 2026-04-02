import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import { BookingChangelogEntryType, logChangeToBooking } from '../../../lib/changelogUtils';
import { fetchBookings } from '../../../lib/db-access';
import {
    fetchBookingWithEquipmentLists,
    insertBooking,
    validateBookingObjectionModel,
} from '../../../lib/db-access/booking';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';
import { toBooking } from '../../../lib/mappers/booking';
import { computePriceSummary } from '../../../lib/pricingUtils';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        switch (req.method) {
            case 'POST':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!req.body.booking) {
                    throw Error('Missing booking parameter');
                }

                if (!validateBookingObjectionModel(req.body.booking)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await insertBooking(req.body.booking)
                    .then(async (result) => {
                        const priceSummary = await fetchBookingWithEquipmentLists(result.id)
                        .then(toBooking)
                        .then(computePriceSummary);
                        
                        logChangeToBooking(
                            context.currentUser,
                            result.id,
                            result.name,
                            BookingChangelogEntryType.CREATE,
                            priceSummary,
                        ).then(() => res.status(200).json(result));
                    })
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            case 'GET':
                await fetchBookings()
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));
                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
        return;
    },
);

export default handler;
