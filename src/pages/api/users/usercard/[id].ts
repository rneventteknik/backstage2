import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '../../../../models/enums/Role';
import { UserCardObjectionModel } from '../../../../models/objection-models/UserCardObjectionModel';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../../lib/apiResponses';
import { authenticateById, getHashedCardId } from '../../../../lib/authenticate';
import { insertUserCard, deleteUserCard } from '../../../../lib/db-access/userAuth';

type UserCardRequest = {
    cardId?: string;
    cardName?: string;
    existingPassword?: string;
    removeCardId?: number;
};

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const userId = Number(req.query.id);

        if (isNaN(userId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        if (context.currentUser.role != Role.ADMIN && context.currentUser.userId != userId) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        // Handle DELETE requests for removing individual cards (no password required)
        if (req.method === 'DELETE') {
            const body = req.body.userCardRequest as UserCardRequest;
            const { removeCardId } = body;

            if (!removeCardId) {
                respondWithInvalidDataResponse(res);
                return;
            }

            const deleted = await deleteUserCard(removeCardId);

            if (!deleted) {
                respondWithEntityNotFoundResponse(res);
                return;
            }

            res.status(200).json({ userId: userId, cardRemoved: true });
            return;
        }

        // Handle POST/PUT requests for adding cards
        if (req.method !== 'PUT' && req.method !== 'POST') {
            respondWithInvalidMethodResponse(res);
            return;
        }

        const body = req.body.userCardRequest as UserCardRequest;
        const { cardId, existingPassword, cardName } = body;

        if (!existingPassword) {
            respondWithInvalidDataResponse(res);
            return;
        }

        if (!(await authenticateById(context.currentUser.userId, existingPassword))) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        if (!cardId) {
            respondWithInvalidDataResponse(res);
            return;
        }

        // Create new user card
        const newCard = new UserCardObjectionModel();
        newCard.userId = userId;
        newCard.cardName = cardName || 'NFC Kort';
        newCard.hashedCardId = getHashedCardId(cardId);

        await insertUserCard(newCard)
            .then((result: UserCardObjectionModel) => res.status(200).json({ userId: result.userId, cardId: result.id, cardName: result.cardName, cardAdded: true }))
            .catch((error: Error) => respondWithCustomErrorMessage(res, error.message));
    },
);

export default handler;
