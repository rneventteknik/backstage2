import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
} from '../../../../lib/apiResponses';
import {
    EquipmentChangelogEntryType,
    hasChanges,
    hasListChanges,
    logArchivalStatusChangeToEquipment,
    logChangeToEquipment,
} from '../../../../lib/changelogUtils';
import {
    deleteEquipment,
    fetchEquipment,
    updateEquipment,
    validateEquipmentObjectionModel,
} from '../../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../../lib/sessionContext';
import { Role } from '../../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<Promise<void> | void> => {
        const equipmentId = Number(req.query.id);

        if (isNaN(equipmentId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        const equipment = await fetchEquipment(equipmentId);

        if (!equipment) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                return fetchEquipment(equipmentId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'DELETE':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                return deleteEquipment(equipmentId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

            case 'PUT':
                if (context.currentUser.role == Role.READONLY) {
                    respondWithAccessDeniedResponse(res);
                    return;
                }

                if (!validateEquipmentObjectionModel(req.body.equipment)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await updateEquipment(equipmentId, req.body.equipment)
                    .then(async (result) => {
                        if (
                            req.body.equipment.isArchived !== undefined &&
                            equipment.isArchived !== req.body.equipment.isArchived
                        ) {
                            await logArchivalStatusChangeToEquipment(
                                context.currentUser,
                                equipmentId,
                                req.body.equipment.isArchived,
                            );
                        }

                        if (hasChanges(equipment, req.body.equipment, ['isArchived'])) {
                            await logChangeToEquipment(context.currentUser, equipmentId);
                        } else if (req.body.equipment.tags && hasListChanges(equipment.tags, req.body.equipment.tags)) {
                            await logChangeToEquipment(context.currentUser, equipmentId);
                        }

                        if (req.body.equipment.prices && hasListChanges(equipment.prices, req.body.equipment.prices)) {
                            logChangeToEquipment(context.currentUser, equipmentId, EquipmentChangelogEntryType.PRICES);
                        }

                        res.status(200).json(result);
                    })

                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithEntityNotFoundResponse(res);
                return;
        }
    },
);

export default handler;
