import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import Breadcrumbs from './Breadcrumbs';
import Layout from './Layout';
import styles from './ErrorPage.module.scss';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import Link from 'next/link';
import { KeyValue } from '../../models/interfaces/KeyValue';

type Props = {
    currentUser: CurrentUserInfo;
    globalSettings: KeyValue[];
    fixedWidth: boolean;
    errorMessage?: string;
};

export const ErrorPage: React.FC<Props> = ({ fixedWidth, currentUser, globalSettings, errorMessage }: Props) => (
    <Layout title="Fel" fixedWidth={fixedWidth} currentUser={currentUser} globalSettings={globalSettings}>
        <Breadcrumbs breadcrumbs={[{ link: '', displayName: 'Fel' }]} />

        <ErrorPageContent errorMessage={errorMessage} />
    </Layout>
);

type ErrorPageContentProps = {
    errorMessage?: string;
};

export const ErrorPageContent: React.FC<ErrorPageContentProps> = ({ errorMessage }: ErrorPageContentProps) => (
    <div className={styles.container + ' d-flex'}>
        <div>
            <FontAwesomeIcon icon={faExclamationCircle} className={styles.icon + ' mr-4 text-muted'} />
        </div>
        <div className="flex-grow-1">
            <h1 className={styles.title}>Ojdå!</h1>
            <p>Det gick inte att ladda innehållet just nu.</p>
            <p className="text-monospace text-muted">{errorMessage}</p>
            <Link href="/" passHref>
                <Button variant="dark" href="/">
                    Gå tillbaka till startsidan
                </Button>
            </Link>
        </div>
    </div>
);
