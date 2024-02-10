import { SettingObjectionModel } from '../../models/objection-models/SettingObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchSetting = async (name: string): Promise<SettingObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return SettingObjectionModel.query().where('name', name).first();
};

export const fetchSettings = async (): Promise<SettingObjectionModel[]> => {
    ensureDatabaseIsInitialized();
    return SettingObjectionModel.query();
};

export const updateSetting = async (id: number, setting: SettingObjectionModel): Promise<SettingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return SettingObjectionModel.query().patchAndFetchById(id, withUpdatedDate(removeIdAndDates(setting)));
};

export const insertSetting = async (setting: SettingObjectionModel): Promise<SettingObjectionModel> => {
    ensureDatabaseIsInitialized();

    return SettingObjectionModel.query().insert(withCreatedDate(removeIdAndDates(setting)));
};

export const deleteSetting = async (id: number): Promise<boolean> => {
    ensureDatabaseIsInitialized();

    return SettingObjectionModel.query()
        .deleteById(id)
        .then((res) => res > 0);
};

export const validateSettingObjectionModel = (setting: SettingObjectionModel): boolean => {
    if (!setting) return false;
    if (!setting.key) return false;
    if (!setting.value) return false;

    return true;
};
