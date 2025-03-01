import '../style/style.scss';
import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import 'react-loading-skeleton/dist/skeleton.css';
import { Provider } from 'react-bus';

// We put the notifications container here, outside of the pages and layout, to allow them
// to persist over page navigation.
//
import NotificationsContainer from '../components/layout/NotificationsContainer';

// We include the font awesome css here to avoid flashing big icons when the page loads.
//
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
config.autoAddCss = false;

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
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
        <DndProvider backend={HTML5Backend}>
            <Provider>
                <NotificationsContainer />
                <Component {...pageProps} />
            </Provider>
        </DndProvider>
    );
}
