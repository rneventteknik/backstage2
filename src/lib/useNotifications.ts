import { NotificationData } from '../components/layout/NotificationsArea';
import { Emitter } from 'mitt';
import {
    faCheckCircle,
    faExclamationCircle,
    faExclamationTriangle,
    faInfoCircle,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useBus } from 'react-bus';

// This is the internal function which emits a add-notification event on the event bus. The
// notification area listens for these events and adds the notification to the list.
const emitNotification = (
    bus: Emitter,
    variant: 'success' | 'warning' | 'danger' | 'info',
    icon: IconDefinition,
    title: string,
    description = '',
    body = '',
    timeout = 5,
): void => {
    const notification: NotificationData = {
        title: title,
        icon: icon,
        variant: variant,
        description: description,
        body: body,
        timeout: timeout,
    };
    bus.emit('notification.add', notification);
};

const showGeneralInfoMessage = (bus: Emitter, title: string, description?: string, body?: string): void =>
    emitNotification(bus, 'info', faInfoCircle, title, description, body);

const showGeneralSuccessMessage = (bus: Emitter, title: string, description?: string, body?: string): void =>
    emitNotification(bus, 'success', faCheckCircle, title, description, body);

const showGeneralWarningMessage = (bus: Emitter, title: string, description?: string, body?: string): void =>
    emitNotification(bus, 'warning', faExclamationTriangle, title, description, body);

const showGeneralDangerMessage = (bus: Emitter, title: string, description?: string, body?: string): void =>
    emitNotification(bus, 'danger', faExclamationCircle, title, description, body);

// Export hook
//
type UseNotificationsType = {
    showGeneralInfoMessage: (title: string, description?: string) => void;
    showGeneralSuccessMessage: (title: string, description?: string) => void;
    showGeneralWarningMessage: (title: string, description?: string) => void;
    showGeneralDangerMessage: (title: string, description?: string) => void;
    showErrorMessage: (errorMessage: string, details?: string) => void;
    showSaveSuccessNotification: (entityType: string) => void;
    showSaveFailedNotification: (entityType: string) => void;
    showCreateSuccessNotification: (entityType: string) => void;
    showCreateFailedNotification: (entityType: string) => void;
    showDeleteSuccessNotification: (entityType: string) => void;
    showDeleteFailedNotification: (entityType: string) => void;
};

export const useNotifications = (): UseNotificationsType => {
    const bus = useBus();
    return {
        // First the general messages
        //
        showGeneralInfoMessage: (title: string, description?: string) =>
            showGeneralInfoMessage(bus, title, description),

        showGeneralSuccessMessage: (title: string, description?: string) =>
            showGeneralSuccessMessage(bus, title, description),

        showGeneralWarningMessage: (title: string, description?: string) =>
            showGeneralWarningMessage(bus, title, description),

        showGeneralDangerMessage: (title: string, description?: string) =>
            showGeneralDangerMessage(bus, title, description),

        // Then more specific ones
        //
        showErrorMessage: (errorMessage: string, details?: string): void =>
            showGeneralDangerMessage(bus, 'Fel!', errorMessage, details),

        showSaveSuccessNotification: (entityType: string): void =>
            showGeneralSuccessMessage(bus, 'Sparad!', entityType + ' sparad.'),

        showSaveFailedNotification: (entityType: string): void =>
            showGeneralDangerMessage(bus, 'Fel!', entityType + ' kunde inte sparas.'),

        showCreateSuccessNotification: (entityType: string): void =>
            showGeneralSuccessMessage(bus, 'Skapad!', entityType + ' skapad.'),

        showCreateFailedNotification: (entityType: string): void =>
            showGeneralDangerMessage(bus, 'Fel!', entityType + ' kunde inte skapas.'),

        showDeleteSuccessNotification: (entityType: string): void =>
            showGeneralSuccessMessage(bus, 'Borttagen!', entityType + ' har tagits bort.'),

        showDeleteFailedNotification: (entityType: string): void =>
            showGeneralDangerMessage(bus, 'Fel!', entityType + ' kunde inte tas bort.'),
    };
};
