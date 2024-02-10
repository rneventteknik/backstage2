import React from 'react';
import { Col, Row } from 'react-bootstrap';
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
        <Row className="mb-3">
            <Col xl={4}>
                <Skeleton height={150} className="mb-3" />
            </Col>
            <Col xl={8}>
                <Skeleton height={250} />
            </Col>
        </Row>
    </Layout>
);

export const FormLoadingPage: React.FC<Props> = ({ fixedWidth, currentUser, globalSettings }: Props) => (
    <Layout title="Laddar..." fixedWidth={fixedWidth} currentUser={currentUser} globalSettings={globalSettings}>
        <Header loading={true}></Header>
        <Row className="mb-3">
            <Col xl={6}>
                <Skeleton height={60} className="mb-4" />
            </Col>
            <Col xl={6}>
                <Skeleton height={60} className="mb-4" />
            </Col>
            <Col xl={6}>
                <Skeleton height={60} className="mb-4" />
            </Col>
            <Col xl={6}>
                <Skeleton height={60} className="mb-4" />
            </Col>
        </Row>
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
