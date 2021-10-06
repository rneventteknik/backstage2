import React from 'react';
import NotificationsArea from './NotificationsArea';
import styles from './NotificationsContainer.module.scss';

const NotificationsContainer: React.FC = () => (
    <div className={styles.notificationsContainer}>
        <div>
            <NotificationsArea />
        </div>
    </div>
);

export default NotificationsContainer;
