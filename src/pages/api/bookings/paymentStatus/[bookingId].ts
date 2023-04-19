import { NextApiRequest, NextApiResponse } from 'next';
import { respondWithAccessDeniedResponse, respondWithInvalidMethodResponse } from '../../../../lib/apiResponses';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { fetchBookingWithEquipmentLists, updateBooking } from '../../../../lib/db-access/booking';
import { PaymentStatus } from '../../../../models/enums/PaymentStatus';
import { Role } from '../../../../models/enums/Role';
import { logPaymentStatusChangeToBooking } from '../../../../lib/changelogUtils';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const bookingId = Number(req.query.bookingId);
        const status = Number(req.query.status) as PaymentStatus;

        if (context.currentUser.role == Role.READONLY) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        const booking = await fetchBookingWithEquipmentLists(bookingId);

        switch (req.method) {
            case 'PUT':
                if (
                    context.currentUser.role === Role.CASH_PAYMENT_MANAGER &&
                    status !== PaymentStatus.READY_FOR_CASH_PAYMENT &&
                    status !== PaymentStatus.PAID_WITH_CASH
                ) {
                    respondWithAccessDeniedResponse(res);
                }

                if (
                    booking.paymentStatus === PaymentStatus.PAID ||
                    booking.paymentStatus === PaymentStatus.INVOICED ||
                    booking.paymentStatus === PaymentStatus.PAID_WITH_INVOICE
                ) {
                    respondWithAccessDeniedResponse(res);
                }

                await updateBooking(bookingId, { paymentStatus: status })
                    .then(async (result) => {
                        await logPaymentStatusChangeToBooking(context.currentUser, bookingId, booking.name, status);

                        res.status(200).json(result);
                    })
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
    null,
);

export default handler;
