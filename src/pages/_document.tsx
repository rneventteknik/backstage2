import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        // Lets Next.js turn off Bootstrap's smooth scrolling while navigating between pages
        <Html data-scroll-behavior="smooth">
            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
