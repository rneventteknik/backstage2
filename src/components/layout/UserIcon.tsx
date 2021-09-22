import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import styles from './UserIcon.module.scss';

type Props = {
    user?: CurrentUserInfo;
};

// String to color function based on https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
// It is used to get a random color based on the username, for the background of the icon.
const stringToColor = (string = '') => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xaa;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const UserDisplay: React.FC<Props> = ({ user }: Props) => (
    <div
        className={styles.profileImage + ' align-middle'}
        style={{ backgroundColor: stringToColor((user?.userId + '-' + user?.name).toString()) }}
    >
        <FontAwesomeIcon icon={faUser} className={styles.profileImageContent} />
    </div>
);

export default UserDisplay;
