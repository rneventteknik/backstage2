import React, { ReactNode } from 'react';

import { CurrentUserInfo } from '../../interfaces/auth/CurrentUserInfo';
import { Role } from '../../interfaces/enums/Role';

type Props = {
    children?: ReactNode;
    currentUser: CurrentUserInfo;
    or?: boolean;
    and?: boolean;
};

export const IfAdmin: React.FC<Props> = ({ children, currentUser, or, and }: Props) => {
    if ((currentUser.role === Role.ADMIN || (or ?? false)) && (and ?? true)) {
        return <>{children}</>;
    } else {
        return null;
    }
};

export const IfNotAdmin: React.FC<Props> = ({ children, currentUser, or, and }: Props) => {
    if ((currentUser.role === Role.ADMIN || (or ?? false)) && (and ?? true)) {
        return null;
    } else {
        return <>{children}</>;
    }
};
