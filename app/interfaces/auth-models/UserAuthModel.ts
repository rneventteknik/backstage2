import { Model } from 'objection';

export class UserAuthModel extends Model {
    static tableName = 'user';

    id!: number;
    name!: string;
    role!: number;
    nameTag!: string;
    username!: string;
    hashedPassword!: string;
}
