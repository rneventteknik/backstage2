import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useUserWithDefaultAccessControl } from '../../lib/useUser';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { Button, Card } from 'react-bootstrap';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import { genericFetcher } from '../../lib/fetchers';
import { getResponseContentOrError, getTokenLabel } from '../../lib/utils';
import { TextLoadingPage } from '../../components/layout/LoadingPageSkeleton';
import { faBan, faCheck, faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../lib/useNotifications';
import { LoginToken } from '../../models/misc/LoginToken';

// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUserWithDefaultAccessControl();
type Props = { user: CurrentUserInfo };

const ApproveLoginTokenPage: React.FC<Props> = ({ user: currentUser }: Props) => {
    const [status, setStatus] = useState<'approved' | 'denied' | null>(null);

    const router = useRouter();
    const sealedToken = Array.isArray(router.query.sealedToken)
        ? router.query.sealedToken[0]
        : router.query.sealedToken;

    const { data: token, isValidating } = useSwr(
        '/api/users/login-token/unseal?sealedToken=' + sealedToken,
        (url: string) => genericFetcher(url).then((x) => x as LoginToken),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        },
    );

    const { showGeneralSuccessMessage, showErrorMessage } = useNotifications();

    const approveToken = () => {
        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/users/login-token/set?sealedToken=' + sealedToken, request)
            .then(getResponseContentOrError)
            .then(() => {
                showGeneralSuccessMessage('Inloggning godkänd');
            })
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Inloggning misslyckades');
            });
        setStatus('approved');
    };
    const denyToken = () => setStatus('denied');

    if (isValidating || !token) {
        return <TextLoadingPage fixedWidth={false} currentUser={currentUser} />;
    }

    return (
        <Layout title="Godkänn inloggning" fixedWidth={true} currentUser={currentUser}>
            <Card className="mb-3">
                <Card.Header>Godkänn inloggning</Card.Header>
                <Card.Body>
                    {status === 'approved' ? (
                        <>
                            <p className="text-center">
                                <FontAwesomeIcon icon={faCheck} size="5x" className="mr-2 text-success" />
                            </p>
                            <p className="mb-0 text-muted">
                                Inloggning {getTokenLabel(token)} godkänd i 60 sekunder. Du kan nu stänga det här
                                fönstret och logga in på din andra enhet.
                            </p>
                        </>
                    ) : null}
                    {status === 'denied' ? (
                        <>
                            <p className="text-center">
                                <FontAwesomeIcon icon={faBan} size="5x" className="mr-2 text-danger" />
                            </p>
                            <p className="mb-0 text-muted">Inloggning avbruten. Du kan nu stänga det här fönstret.</p>
                        </>
                    ) : null}
                    {status === null ? (
                        <>
                            <p
                                className="text-monospace text-center font-weight-bold mt-3"
                                style={{ fontSize: '1.5rem' }}
                            >
                                {getTokenLabel(token)}
                            </p>
                            <p className="mb-0">
                                Inloggningen kommer från ip-address <span className="text-monospace">{token.ip}</span>.
                            </p>
                        </>
                    ) : null}
                </Card.Body>{' '}
                {status === null ? (
                    <Card.Footer>
                        <Button variant="primary" onClick={() => approveToken()} className="mr-2">
                            <FontAwesomeIcon icon={faKey} className="mr-2" />
                            Godkänn
                        </Button>
                        <Button variant="secondary" onClick={() => denyToken()} className="mr-2">
                            <FontAwesomeIcon icon={faBan} className="mr-2" />
                            Avbryt
                        </Button>
                    </Card.Footer>
                ) : null}
            </Card>
        </Layout>
    );
};

export default ApproveLoginTokenPage;
