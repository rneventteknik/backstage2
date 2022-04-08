import { TimeEstimateObjectionModel } from '../../models/objection-models/TimeEstimateObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchTimeEstimate = async (id: number): Promise<TimeEstimateObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return TimeEstimateObjectionModel.query().findById(id);
};

export const fetchTimeEstimates = async (): Promise<TimeEstimateObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return TimeEstimateObjectionModel.query();
};

export const fetchTimeEstimatesByEventId = async (id: number): Promise<TimeEstimateObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return TimeEstimateObjectionModel.query().where('eventId', id);
};

export const updateTimeEstimate = async (
    id: number,
    timeEstimate: TimeEstimateObjectionModel,
): Promise<TimeEstimateObjectionModel> => {
    ensureDatabaseIsInitialized();

    return TimeEstimateObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(timeEstimate)));
};

export const insertTimeEstimate = async (
    timeEstimate: TimeEstimateObjectionModel,
): Promise<TimeEstimateObjectionModel> => {
    ensureDatabaseIsInitialized();

    return TimeEstimateObjectionModel.query().insert(withCreatedDate(removeIdAndDates(timeEstimate)));
};

export const deleteTimeEstimate = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return TimeEstimateObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateTimeEstimateObjectionModel = (timeEstimate: TimeEstimateObjectionModel): boolean => {
    if (!timeEstimate) return false;

    return true;
};
