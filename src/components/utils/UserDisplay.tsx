import React from 'react';
import { User } from '../../models/interfaces';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import UserIcon from './UserIcon';

type Props = {
    user: CurrentUserInfo | User;
};

const UserDisplay: React.FC<Props> = ({ user }: Props) => {
    return (
        <>
            <UserIcon user={user} /> {user.name}
        </>
    );
};

export default UserDisplay;
