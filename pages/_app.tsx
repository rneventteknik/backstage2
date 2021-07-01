import '../style/style.scss';
import React from 'react';
import { AppProps } from 'next/app';
import 'react-bootstrap-typeahead/css/Typeahead.css';

// We include the font awesome css here to avoid flashing big icons when the page loads.
//
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return <Component {...pageProps} />;
}
