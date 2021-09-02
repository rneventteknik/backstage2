import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Toast } from 'react-bootstrap';
import { useListener } from 'react-bus';
import { v4 as generateGuid } from 'uuid';
import styles from './NotificationArea.module.scss';

export type NotificationData = {
    title: string;
    description?: string;
    body?: string;
    timeout: number;
    icon: IconDefinition;
    variant: 'success' | 'warning' | 'danger' | 'info';
};

type InternalNotificationData = NotificationData & {
    id: string;
    show: boolean;
};

type NotificationProps = {
    notification: InternalNotificationData;
    onClose: () => unknown;
};

const getNotificationTypeClassName = (variant: 'success' | 'warning' | 'danger' | 'info') => {
    switch (variant) {
        case 'success':
            return styles.success;
        case 'warning':
            return styles.warning;
        case 'danger':
            return styles.danger;
        case 'info':
            return styles.info;
    }
};

const Notification: React.FC<NotificationProps> = ({ notification, onClose }: NotificationProps) => (
    <Toast
        onClose={onClose}
        show={notification.show}
        animation={true}
        delay={notification.timeout * 1000}
        autohide
        className={styles.notification + ' ' + getNotificationTypeClassName(notification.variant)}
    >
        <Toast.Header className={styles.header}>
            <span className="mr-auto">
                <strong>
                    <span className={styles.iconContainer}>
                        <FontAwesomeIcon icon={notification.icon} size="lg" className={styles.icon} />
                    </span>
                    {notification.title}{' '}
                </strong>
                {notification.description}
            </span>
        </Toast.Header>
        {notification.body ? <Toast.Body>{notification.body}</Toast.Body> : null}
    </Toast>
);

const NotificationArea: React.FC = () => {
    const [notifications, setNotifications] = useState<InternalNotificationData[]>([]);

    // Helper methods
    //
    const showNotification = (notification: InternalNotificationData) =>
        setNotifications((list) => list.map((x) => ({ ...x, show: x.id === notification.id ? true : x.show })));

    const addNotification = (notification: InternalNotificationData) =>
        setNotifications((list) => [notification, ...list]);

    const hideNotification = (notification: InternalNotificationData) =>
        setNotifications((list) => list.map((x) => ({ ...x, show: x.id === notification.id ? false : x.show })));

    const removeNotification = (notification: InternalNotificationData) =>
        setNotifications((list) => list.filter((n) => n.id !== notification.id));

    // Configure listener to add notifications and handler to remove
    //
    useListener('notification.add', (notification: NotificationData | undefined) => {
        if (notification) {
            const notificationWithInternalData = { ...notification, id: generateGuid(), show: false };

            // To get the fade in animation, we first add it hidden and the show it.
            addNotification(notificationWithInternalData);
            setTimeout(() => showNotification(notificationWithInternalData), 5);
        }
    });

    const closeNotificationHandler = (notification: InternalNotificationData) => {
        // To get the fade in animation, we first set it to hidden and then we delete it after a delay.
        hideNotification(notification);
        setTimeout(() => removeNotification(notification), 1000);
    };

    return (
        <>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onClose={() => closeNotificationHandler(notification)}
                />
            ))}
        </>
    );
};

export default NotificationArea;
