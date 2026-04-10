import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useListener } from 'react-bus';
import { v4 as generateGuid } from 'uuid';
import styles from './NotificationsArea.module.scss';

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

const Notification: React.FC<NotificationProps> = ({ notification, onClose }: NotificationProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (notification.show) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                onClose();
            }, notification.timeout * 1000);
            return () => clearTimeout(timer);
        }
    }, [notification.show, notification.timeout, onClose]);

    if (!notification.show && !visible) return null;

    return (
        <div
            className={`${styles.notification} ${getNotificationTypeClassName(notification.variant)} flex items-start gap-3 px-4 py-3 mb-2 border shadow-lg`}
        >
            <span className={styles.iconContainer}>
                <FontAwesomeIcon icon={notification.icon} size="lg" className={styles.icon} />
            </span>
            <div className="flex-grow">
                <strong>{notification.title}</strong>{' '}
                {notification.description}
                {notification.body && <div className="mt-1 text-sm">{notification.body}</div>}
            </div>
            <button onClick={onClose} className="text-muted hover:text-body ml-2" aria-label="Close">
                ×
            </button>
        </div>
    );
};

const NotificationsArea: React.FC = () => {
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
    useListener('notification.add', (event: unknown) => {
        const notification = event as NotificationData | undefined;
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
        <div>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onClose={() => closeNotificationHandler(notification)}
                />
            ))}
        </div>
    );
};

export default NotificationsArea;
