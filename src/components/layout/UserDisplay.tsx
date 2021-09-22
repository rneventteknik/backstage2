import React from 'react';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import UserIcon from './UserIcon';

type Props = {
    user: CurrentUserInfo;
};

const UserDisplay: React.FC<Props> = ({ user }: Props) => {
    return (
        <>
            <UserIcon user={user} /> {user.name}
        </>
    );
};

export default UserDisplay;
