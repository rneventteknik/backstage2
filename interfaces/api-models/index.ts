// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

// export type User = {
//   id: number
//   name: string
// }

export { EventApiModel } from './EventApiModel';
export { UserApiModel } from './UserApiModel';

export interface BaseApiModelWithName extends BaseApiModel {
    name: string;
}

export interface BaseApiModel {
    id?: number;
    created?: string;
    updated?: string;
}
