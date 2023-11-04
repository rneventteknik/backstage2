import { StatusTrackingObjectionModel } from '../../models/objection-models/StatusTrackingObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchStatusTrackings = async (): Promise<StatusTrackingObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return StatusTrackingObjectionModel.query();
};

export const fetchStatusTrackingsPublic = async (): Promise<StatusTrackingObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return StatusTrackingObjectionModel.query().select('name', 'lastStatusUpdate', 'key', 'value');
};

export const fetchStatusTrackingByKey = async (key: string): Promise<StatusTrackingObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return StatusTrackingObjectionModel.query().where('key', key).first();
};

export const updateStatusTracking = async (
    id: number,
    statusTracking: Partial<StatusTrackingObjectionModel>,
): Promise<StatusTrackingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return StatusTrackingObjectionModel.query().patchAndFetchById(
        id,
        withUpdatedDate(removeIdAndDates(statusTracking)),
    );
};

export const insertStatusTracking = async (
    statusTracking: StatusTrackingObjectionModel,
): Promise<StatusTrackingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return StatusTrackingObjectionModel.query().insert(withCreatedDate(removeIdAndDates(statusTracking)));
};

export const deleteStatusTracking = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return StatusTrackingObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateStatusTrackingObjectionModel = (statusTracking: StatusTrackingObjectionModel): boolean => {
    if (!statusTracking) return false;
    if (!statusTracking.key) return false;

    return true;
};
