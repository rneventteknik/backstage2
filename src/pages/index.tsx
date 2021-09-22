import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { useUserWithDefaultAccessControl } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';

export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const IndexPage: React.FC<Props> = ({ user }: Props) => (
    <Layout title="Hem" breadcrumbs={[]} fixedWidth={true} currentUser={user}>
        <h1>Hello RN 👋</h1>
        <p>
            <Link href="/about">
                <a>About</a>
            </Link>
        </p>
    </Layout>
);

export default IndexPage;
