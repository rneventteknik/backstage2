import '../style/style.scss';
import React from 'react';
import { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return <Component {...pageProps} />;
}
