import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { QRCodeSVG } from 'qrcode.react';
import React, { useState } from 'react';
import { Button, ButtonProps, Modal, Spinner } from 'react-bootstrap';
import { useNotifications } from '../lib/useNotifications';
import { getResponseContentOrError, getTokenLabel } from '../lib/utils';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import Router from 'next/router';
import { LoginTokenWrapper } from '../models/misc/LoginToken';

const LoginTokenButton: React.FC<ButtonProps> = (props: ButtonProps) => {
    const [showLoginTokenModal, setShowLoginTokenModal] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<LoginTokenWrapper | null>(null);

    const { showErrorMessage } = useNotifications();

    const loginWithToken = () => {
        generateToken();
        setShowLoginTokenModal(true);
    };

    const generateToken = () => {
        const request = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };

        fetch('/api/users/login-token/generate', request)
            .then(getResponseContentOrError)
            .then((data) => data as LoginTokenWrapper)
            .then(setGeneratedToken)
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Tokengenereringen misslyckades');
            });
    };

    return (
        <>
            <Button {...props} onClick={() => loginWithToken()}>
                <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                Logga in med QR-kod
            </Button>
            <LoginTokenModal
                show={showLoginTokenModal}
                hide={() => setShowLoginTokenModal(false)}
                token={generatedToken}
            />
        </>
    );
};

type LoginTokenModalProps = {
    hide: () => void;
    show: boolean;
    token: LoginTokenWrapper | null;
};

const LoginTokenModal: React.FC<LoginTokenModalProps> = ({ hide, show, token }: LoginTokenModalProps) => {
    const { showErrorMessage, showGeneralSuccessMessage } = useNotifications();
    const onCancel = () => {
        hide();
    };

    const getQrCodeLink = (token: LoginTokenWrapper) => {
        return process.env.NEXT_PUBLIC_BACKSTAGE2_BASE_URL + '/approveLoginToken/' + token.sealedToken;
    };

    const login = () => {
        const body = {
            sealedToken: token?.sealedToken,
        };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/users/login-with-token', request)
            .then((res) => {
                if (res.status !== 200 && res.status !== 403) {
                    throw new Error(res.statusText);
                }
                return res.json();
            })
            .then((data) => data as CurrentUserInfo)
            .then((user) => {
                if (!user.isLoggedIn) {
                    showErrorMessage('Inloggningen misslyckades');
                }
                showGeneralSuccessMessage('Inloggningen lyckade', 'Inloggad som ' + user.name);
                Router.push('/');
            })
            .catch((error) => {
                console.error('An unexpected error happened:', error);
            });
    };

    return (
        <Modal show={show} onHide={onCancel} size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Logga in med QR-kod</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {token ? (
                    <>
                        <QRCodeSVG value={getQrCodeLink(token)} className="w-100" size={256} includeMargin={true} />
                        <p className="text-monospace text-center font-weight-bold mt-3" style={{ fontSize: '1.5rem' }}>
                            {getTokenLabel(token.token)}
                        </p>
                        <p className="text-muted">
                            Skanna QR-koden med en enhet där du är inloggad, godkänn inloggningen, och klicka sedan på
                            Logga in nedan.
                        </p>
                    </>
                ) : (
                    <div className="text-center">
                        <Spinner animation="border" role="status"></Spinner>{' '}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={login}>
                    Logga In
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LoginTokenButton;
