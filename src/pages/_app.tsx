import '../style/style.scss';
import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { Provider } from 'react-bus';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// We put the notifications container here, outside of the pages and layout, to allow them
// to persist over page navigation.
//
import NotificationsContainer from '../components/layout/NotificationsContainer';

// We include the font awesome css here to avoid flashing big icons when the page loads.
//
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
config.autoAddCss = false;

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: '/ingest',
            ui_host: 'https://eu.posthog.com',
            persistence: 'localStorage',
            capture_exceptions: true,
            debug: process.env.NODE_ENV === 'development',
        });
    }, []);

    useEffect(() => {
        const odds = 1000;
        const result = Math.floor(Math.random() * odds + 1);

        if (result === 1) {
            const style = document.createElement('style');
            style.textContent = "* { font-family: 'Comic Sans MS'; }";
            document.head.append(style);
        }
    }, []);

    return (
        <PostHogProvider client={posthog}>
            <DndContext sensors={sensors} collisionDetection={closestCenter}>
                <Provider>
                    <NotificationsContainer />
                    <Component {...pageProps} />
                </Provider>
            </DndContext>
        </PostHogProvider>
    );
}
