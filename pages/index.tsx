import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const IndexPage: React.FC = () => (
    <Layout title="Home | backstage2">
        <h1>Hello RN 👋</h1>
        <p>
            <Link href="/about">
                <a>About</a>
            </Link>
        </p>
    </Layout>
);

export default IndexPage;
