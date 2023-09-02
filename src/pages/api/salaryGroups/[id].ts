import { NextApiRequest, NextApiResponse } from 'next';
import {
    respondWithAccessDeniedResponse,
    respondWithCustomErrorMessage,
    respondWithEntityNotFoundResponse,
    respondWithInvalidDataResponse,
    respondWithInvalidMethodResponse,
} from '../../../lib/apiResponses';
import {
    deleteSalaryGroup,
    fetchSalaryGroup,
    updateSalaryGroup,
    validateSalaryGroupObjectionModel,
} from '../../../lib/db-access';
import { SessionContext, withSessionContext } from '../../../lib/sessionContext';
import { Role } from '../../../models/enums/Role';

const handler = withSessionContext(
    async (req: NextApiRequest, res: NextApiResponse, context: SessionContext): Promise<void> => {
        const salaryGroupId = Number(req.query.id);

        if (context.currentUser.role != Role.ADMIN) {
            respondWithAccessDeniedResponse(res);
            return;
        }

        if (isNaN(salaryGroupId)) {
            respondWithEntityNotFoundResponse(res);
            return;
        }

        switch (req.method) {
            case 'GET':
                await fetchSalaryGroup(salaryGroupId)
                    .then((result) => (result ? res.status(200).json(result) : respondWithEntityNotFoundResponse(res)))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'DELETE':
                await deleteSalaryGroup(salaryGroupId)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => res.status(500).json({ statusCode: 500, message: error.message }));

                break;

            case 'PUT':
                if (!validateSalaryGroupObjectionModel(req.body.salaryGroup)) {
                    respondWithInvalidDataResponse(res);
                    return;
                }

                await updateSalaryGroup(salaryGroupId, req.body.salaryGroup)
                    .then((result) => res.status(200).json(result))
                    .catch((error) => respondWithCustomErrorMessage(res, error.message));

                break;

            default:
                respondWithInvalidMethodResponse(res);
        }
    },
);

export default handler;
