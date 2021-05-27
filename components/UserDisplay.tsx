import React from 'react';
import { CurrentUserInfo } from '../interfaces/auth/CurrentUserInfo';
import UserIcon from './UserIcon';

type Props = {
    user?: CurrentUserInfo;
};

const UserDisplay: React.FC<Props> = ({ user }: Props) => {
    if (!user) {
        return <span>-</span>;
    }

    return (
        <>
            <UserIcon user={user} /> {user.name}
        </>
    );
};

export default UserDisplay;
