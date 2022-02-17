import '../style/style.scss';
import React from 'react';
import { AppProps } from 'next/app';
import 'react-bootstrap-typeahead/css/Typeahead.css';
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
config.autoAddCss = false;

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <Provider>
            <NotificationsContainer />
            <Component {...pageProps} />
        </Provider>
    );
}
