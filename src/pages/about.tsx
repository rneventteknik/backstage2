import React from 'react';
import Layout from '../components/layout/Layout';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { useUserWithDefaultAccessAndWithSettings } from '../lib/useUser';
import Header from '../components/layout/Header';
import { KeyValue } from '../models/interfaces/KeyValue';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getGlobalSetting } from '../lib/utils';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessAndWithSettings();
type Props = { user: CurrentUserInfo; globalSettings: KeyValue[] };
const pageTitle = 'Hjälp';
const breadcrumbs = [{ link: 'about', displayName: pageTitle }];

const AboutPage: React.FC<Props> = ({ user: currentUser, globalSettings }: Props) => (
    <Layout title={pageTitle} fixedWidth={true} currentUser={currentUser} globalSettings={globalSettings}>
        <Header title={pageTitle} breadcrumbs={breadcrumbs}></Header>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {getGlobalSetting('content.helpPageText', globalSettings)}
        </ReactMarkdown>
    </Layout>
);

export default AboutPage;
