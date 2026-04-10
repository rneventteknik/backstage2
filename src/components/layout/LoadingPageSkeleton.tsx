import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import Header from './Header';
import Layout from './Layout';

type Props = {
    currentUser: CurrentUserInfo;
    globalSettings: KeyValue[];
    fixedWidth: boolean;
};

export const TwoColLoadingPage: React.FC<Props> = ({ fixedWidth, currentUser, globalSettings }: Props) => (
    <Layout title="Laddar..." fixedWidth={fixedWidth} currentUser={currentUser} globalSettings={globalSettings}>
        <Header loading={true}></Header>
        <div className="flex flex-wrap gap-3 mb-3">
            <div className="basis-1/4 grow">
                <Skeleton height={150} className="mb-3" />
            </div>
            <div className="basis-2/3 grow">
                <Skeleton height={250} />
            </div>
        </div>
    </Layout>
);

export const FormLoadingPage: React.FC<Props> = ({ fixedWidth, currentUser, globalSettings }: Props) => (
    <Layout title="Laddar..." fixedWidth={fixedWidth} currentUser={currentUser} globalSettings={globalSettings}>
        <Header loading={true}></Header>
        <div className="grid grid-cols-2 gap-3 mb-3">
            <Skeleton height={60} className="mb-4" />
            <Skeleton height={60} className="mb-4" />
            <Skeleton height={60} className="mb-4" />
            <Skeleton height={60} className="mb-4" />
        </div>
    </Layout>
);

export const TableLoadingPage: React.FC<Props> = ({ fixedWidth, currentUser, globalSettings }: Props) => (
    <Layout title="Laddar..." fixedWidth={fixedWidth} currentUser={currentUser} globalSettings={globalSettings}>
        <Header loading={true}></Header>
        <Skeleton height={150} className="mb-3" />
    </Layout>
);

export const TextLoadingPage: React.FC<Props> = ({ fixedWidth, currentUser, globalSettings }: Props) => (
    <Layout title="Laddar..." fixedWidth={fixedWidth} currentUser={currentUser} globalSettings={globalSettings}>
        <Header loading={true}></Header>
        <Skeleton count={5} />
    </Layout>
);
