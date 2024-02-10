import { Setting } from '../../models/interfaces';
import { ISettingObjectionModel } from '../../models/objection-models/SettingObjectionModel';
import { toDatetimeOrUndefined } from '../datetimeUtils';

export const toSetting = (objectionModel: ISettingObjectionModel): Setting => {
    if (!objectionModel.id) {
        throw 'Invalid setting';
    }

    return {
        ...objectionModel,
        id: objectionModel.id,
        updated: toDatetimeOrUndefined(objectionModel.updated),
        created: toDatetimeOrUndefined(objectionModel.created),
    };
};
