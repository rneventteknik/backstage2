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
import { isValidCardId } from '../../../../lib/cardId';
import { insertUserCard, deleteUserCards, isUserCardRegistered } from '../../../../lib/db-access/userAuth';

type UserCardRequest = {
    cardId?: string;
    cardName?: string;
    existingPassword?: string;
    removeCardIds?: number[];
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

        if (req.method !== 'POST' && req.method !== 'DELETE') {
            respondWithInvalidMethodResponse(res);
            return;
        }

        const body = req.body.userCardRequest as UserCardRequest;
        const { cardId, existingPassword, cardName, removeCardIds } = body;

        // Both adding and removing cards require the password of the current user
        if (!existingPassword) {
            respondWithInvalidDataResponse(res);
            return;
        }

        if (!(await authenticateById(context.currentUser.userId, existingPassword))) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        // Handle DELETE requests for removing cards
        if (req.method === 'DELETE') {
            if (
                !Array.isArray(removeCardIds) ||
                removeCardIds.length === 0 ||
                !removeCardIds.every((id) => Number.isInteger(id))
            ) {
                respondWithInvalidDataResponse(res);
                return;
            }

            const removedCount = await deleteUserCards(userId, removeCardIds);

            if (removedCount === 0) {
                respondWithEntityNotFoundResponse(res);
                return;
            }

            res.status(200).json({ userId: userId, removedCount: removedCount });
            return;
        }

        // Handle POST requests for adding cards
        if (!cardId || !isValidCardId(cardId)) {
            respondWithInvalidDataResponse(res);
            return;
        }

        const hashedCardId = getHashedCardId(cardId);

        // Card IDs are unique, so a card can only be registered to one user
        if (await isUserCardRegistered(hashedCardId)) {
            res.status(409).json({ statusCode: 409, message: 'Card is already registered' });
            return;
        }

        // Create new user card
        const newCard = new UserCardObjectionModel();
        newCard.userId = userId;
        newCard.cardName = cardName || 'NFC Kort';
        newCard.hashedCardId = hashedCardId;

        await insertUserCard(newCard)
            .then((result: UserCardObjectionModel) =>
                res
                    .status(200)
                    .json({ userId: result.userId, cardId: result.id, cardName: result.cardName, cardAdded: true }),
            )
            .catch((error: Error) => respondWithCustomErrorMessage(res, error.message));
    },
);

export default handler;
