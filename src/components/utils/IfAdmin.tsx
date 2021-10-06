import React, { ReactNode } from 'react';

import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { Role } from '../../models/enums/Role';

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

export const IfReadonly: React.FC<Props> = ({ children, currentUser, or, and }: Props) => {
    if ((currentUser.role === Role.READONLY || (or ?? false)) && (and ?? true)) {
        return <>{children}</>;
    } else {
        return null;
    }
};

export const IfNotReadonly: React.FC<Props> = ({ children, currentUser, or, and }: Props) => {
    if ((currentUser.role === Role.READONLY || (or ?? false)) && (and ?? true)) {
        return null;
    } else {
        return <>{children}</>;
    }
};
