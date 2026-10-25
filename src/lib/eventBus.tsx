import mitt, { Emitter } from 'mitt';
import { createContext, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import type { NotificationData } from '../components/layout/NotificationsArea';

// App-wide event bus, used to let one component trigger an action in another unrelated component (for example
// showing a notification). The events and their payload types are declared here.
type BusEvents = {
    'notification.add': NotificationData;
};

export type EventBus = Emitter<BusEvents>;

const EventBusContext = createContext<EventBus | null>(null);

export const EventBusProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [bus] = useState(() => mitt<BusEvents>());
    return <EventBusContext.Provider value={bus}>{children}</EventBusContext.Provider>;
};

export const useEventBus = (): EventBus => {
    const bus = useContext(EventBusContext);
    if (!bus) {
        throw new Error('useEventBus must be used inside an EventBusProvider');
    }
    return bus;
};

// Adds the listener after mount and removes it before unmount.
export const useEventListener = <K extends keyof BusEvents>(name: K, listener: (event: BusEvents[K]) => void): void => {
    const bus = useEventBus();
    useEffect(() => {
        bus.on(name, listener);
        return () => bus.off(name, listener);
    }, [bus, name, listener]);
};
