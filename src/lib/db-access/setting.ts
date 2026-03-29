import { SettingObjectionModel } from '../../models/objection-models/SettingObjectionModel';
import { ensureDatabaseIsInitialized } from '../database';
import { removeIdAndDates, withCreatedDate, withUpdatedDate } from './utils';

export const fetchSetting = async (key: string): Promise<SettingObjectionModel | undefined> => {
    ensureDatabaseIsInitialized();
    return SettingObjectionModel.query().where('key', key).first();
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

export const upsertSetting = async (key: string, value: string): Promise<SettingObjectionModel> => {
    ensureDatabaseIsInitialized();

    const existing = await SettingObjectionModel.query().where('key', key).first();

    if (existing) {
        return SettingObjectionModel.query().patchAndFetchById(
            existing.$id() as number,
            withUpdatedDate({ value } as SettingObjectionModel),
        );
    }

    return SettingObjectionModel.query().insert(
        withCreatedDate({ key, value } as SettingObjectionModel),
    );
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
