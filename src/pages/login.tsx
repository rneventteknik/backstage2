import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Form, FormControl, Button, FormGroup, Alert, Spinner } from 'react-bootstrap';
import Router from 'next/router';
import posthog from 'posthog-js';
import { useUser } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { getGlobalSetting, getRoleName, getValueOrFirst } from '../lib/utils';
import { KeyValue } from '../models/interfaces/KeyValue';
import Head from 'next/head';
import EnvironmentTypeTag from '../components/utils/EnvironmentTypeTag';
import { GetServerSidePropsContext } from 'next';

const containerStyle = {
    margin: 'auto',
    marginTop: '8rem',
    width: 500,
    maxWidth: '90%',
    padding: '2rem',
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    // 1. Check existing session (redirects to '/' if logged in)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const userCheck = await useUser(undefined, undefined, '/')(context);

    if ('redirect' in userCheck) {
        return userCheck;
    }

    const req = context.req;
    let isMtlsValid = false;

    if (process.env.NODE_ENV === 'production') {
        // Security check: Verify origin came through Cloudflare
        const originSecret = req.headers['x-origin-secret'];
        const isFromCloudflare = originSecret === process.env.CF_ORIGIN_SECRET;

        if (isFromCloudflare) {
            const certStatus = req.headers['cf-client-cert-verify'];
            isMtlsValid = certStatus === 'SUCCESS';
        }
    } else {
        // Local Dev Mock
        isMtlsValid = true;
    }

    return {
        props: {
            ...('props' in userCheck ? userCheck.props : {}),
            initialMtlsValid: isMtlsValid,
        },
    };
};

// --- Hidden Auto-Focusing Input for USB Keyboard-Emulation Readers ---
type CardReaderInputProps = {
    onCardSubmit: (cardId: string) => void;
    disabled?: boolean;
};

const CardReaderInput: React.FC<CardReaderInputProps> = ({ onCardSubmit, disabled }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState('');

    useEffect(() => {
        const focusInput = () => {
            if (inputRef.current && !disabled) {
                inputRef.current.focus();
            }
        };

        focusInput();
        document.addEventListener('click', focusInput);

        return () => {
            document.removeEventListener('click', focusInput);
        };
    }, [disabled]);

    const handleBlur = () => {
        if (!disabled) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed) {
                onCardSubmit(trimmed);
                setValue('');
            }
        }
    };

    return (
        <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
            aria-label="NFC Card Reader Input"
            style={{
                position: 'absolute',
                opacity: 0,
                top: '-9999px',
                left: '-9999px',
                width: '1px',
                height: '1px',
                pointerEvents: 'none',
            }}
        />
    );
};

// --- Main Page Component ---
type Props = {
    globalSettings: KeyValue[];
    initialMtlsValid: boolean;
};

const LoginPage: React.FC<Props> = ({ globalSettings, initialMtlsValid }) => {
    const [authMethod, setAuthMethod] = useState<'NFC' | 'PASSWORD'>(initialMtlsValid ? 'NFC' : 'PASSWORD');

    const [showWrongPasswordError, setShowWrongPasswordError] = useState(false);
    const [showServerError, setShowServerError] = useState(false);
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const usernameFieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (authMethod === 'PASSWORD' && usernameFieldRef.current?.focus) {
            usernameFieldRef.current.focus();
        }
    }, [authMethod]);

    const getRedirectUrl = () => {
        const url = getValueOrFirst(Router.query.redirectUrl);

        if (!url || url.startsWith('/api/') || url.startsWith('/_next/')) {
            return '/';
        }

        return url;
    };

    const handleLoginSubmit = async (body: Record<string, unknown>) => {
        setWaitingForResponse(true);
        setShowWrongPasswordError(false);
        setShowServerError(false);

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        fetch('/api/users/login', request)
            .then((res) => {
                if (res.status !== 200 && res.status !== 403) {
                    throw new Error(res.statusText);
                }
                return res.json();
            })
            .then((data) => data as CurrentUserInfo)
            .then((user) => {
                if (user.isLoggedIn) {
                    posthog.identify(String(user.userId), {
                        name: user.name,
                        role: getRoleName(user.role),
                    });
                    Router.push(getRedirectUrl());
                } else {
                    setShowWrongPasswordError(true);
                }
                setWaitingForResponse(false);
            })
            .catch((error) => {
                console.error('An unexpected error happened:', error);
                setShowServerError(true);
                setWaitingForResponse(false);
            });
    };

    const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(['username', 'password'].map((key) => [key, formData.get(key)]));
        handleLoginSubmit(body);
    };

    return (
        <div style={containerStyle}>
            <Head>
                <title>Login | Backstage2</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href={getGlobalSetting('content.image.favIcon', globalSettings, '')}
                />
            </Head>
            <h1>
                Backstage2
                <span style={{ fontSize: '0.6em', position: 'relative', top: '-3px' }} className="ms-2">
                    <EnvironmentTypeTag globalSettings={globalSettings} />
                </span>
            </h1>

            {showWrongPasswordError ? (
                <Alert variant="danger">
                    {authMethod === 'NFC' ? 'Felaktigt eller okänt kort.' : 'Felaktigt användarnamn eller lösenord.'}
                </Alert>
            ) : null}

            {showServerError ? (
                <Alert variant="danger">
                    <strong>Serverfel</strong> Det gick inte att logga in, försök igen senare.
                </Alert>
            ) : null}

            {/* CARD READER MODE */}
            {authMethod === 'NFC' ? (
                <div className="p-4 text-center border rounded position-relative">
                    <CardReaderInput
                        onCardSubmit={(cardId) => handleLoginSubmit({ cardId })}
                        disabled={waitingForResponse}
                    />


                    <h4>Blippa ditt Kort </h4>
                    <p className="text-muted">Kortläsaren är redo. Blip ditt kort nu...</p>

                    {waitingForResponse ? (
                        <div className="d-flex align-items-center justify-content-center gap-2 text-primary mt-3">
                            <Spinner animation="border" size="sm" />
                            <span>Verifierar kort...</span>
                        </div>
                    ) : (
                        <div className="text-success small fw-bold mt-2">Väntar på kort-indata</div>
                    )}

                    <hr className="my-4" />

                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => setAuthMethod('PASSWORD')}
                        className="text-decoration-none"
                    >
                        Använd användarnamn och lösenord istället
                    </Button>
                </div>
            ) : (
                /* USERNAME / PASSWORD MODE */
                <Form action="/api/users/login" method="post" onSubmit={handlePasswordSubmit}>
                    <FormGroup className="mb-3">
                        <FormControl type="text" placeholder="Användarnamn" name="username" ref={usernameFieldRef} />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <FormControl
                            type={!showPassword ? 'password' : 'text'}
                            placeholder="Lösenord"
                            name="password"
                            autoComplete="off"
                        />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <Form.Check
                            type="switch"
                            name="show password"
                            id="showPasswordToggle"
                            label="Visa lösenord"
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                    </FormGroup>

                    {waitingForResponse ? (
                        <Button variant="outline-primary" type="submit" disabled className="w-100">
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loggar
                            in...
                        </Button>
                    ) : (
                        <Button variant="outline-primary" type="submit" className="w-100">
                            Logga in
                        </Button>
                    )}

                    {initialMtlsValid && (
                        <div className="text-center mt-3">
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => setAuthMethod('NFC')}
                                className="text-decoration-none"
                            >
                                Använd kortläsare istället
                            </Button>
                        </div>
                    )}
                </Form>
            )}
        </div>
    );
};

export default LoginPage;
