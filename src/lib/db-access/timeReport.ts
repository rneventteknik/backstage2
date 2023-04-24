import { TimeReportObjectionModel } from '../../models/objection-models/TimeReportObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchTimeReport = async (id: number): Promise<TimeReportObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return TimeReportObjectionModel.query().findById(id).withGraphFetched('user');
};

export const fetchTimeReports = async (): Promise<TimeReportObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return TimeReportObjectionModel.query();
};

export const fetchTimeReportsByBookingId = async (id: number): Promise<TimeReportObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return TimeReportObjectionModel.query().where('bookingId', id).withGraphFetched('user');
};

export const updateTimeReport = async (
    id: number,
    timeReport: TimeReportObjectionModel,
): Promise<TimeReportObjectionModel> => {
    ensureDatabaseIsInitialized();

    return TimeReportObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(timeReport)));
};

export const insertTimeReport = async (timeReport: TimeReportObjectionModel): Promise<TimeReportObjectionModel> => {
    ensureDatabaseIsInitialized();

    return TimeReportObjectionModel.query()
        .insert(withCreatedDate(removeIdAndDates(timeReport)))
        .withGraphFetched('user');
};

export const deleteTimeReport = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return TimeReportObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateTimeReportObjectionModel = (timeReport: TimeReportObjectionModel): boolean => {
    if (!timeReport) return false;
    if (!timeReport.name) return false;

    if (isNaN(timeReport.pricePerHour) || timeReport.pricePerHour < 0) return false;
    if (isNaN(timeReport.billableWorkingHours) || timeReport.billableWorkingHours < 0) return false;
    if (isNaN(timeReport.actualWorkingHours) || timeReport.billableWorkingHours < 0) return false;

    return true;
};
