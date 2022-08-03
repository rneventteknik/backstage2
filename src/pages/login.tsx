import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Form, FormControl, Button, FormGroup, Alert, Spinner } from 'react-bootstrap';
import Router from 'next/router';
import { useUser } from '../lib/useUser';
import { CurrentUserInfo } from '../models/misc/CurrentUserInfo';
import { getValueOrFirst } from '../lib/utils';

const containerStyle = {
    margin: 'auto',
    marginTop: '8rem',
    width: 500,
    maxWidth: '90%',
    padding: '2rem',
};

// Redirect to '/' if the user is already logged in
// eslint-disable-next-line react-hooks/rules-of-hooks
export const getServerSideProps = useUser(undefined, undefined, '/');

const LoginPage: React.FC = () => {
    const [showWrongPasswordError, setShowWrongPasswordError] = useState(false);
    const [showServerError, setShowServerError] = useState(false);
    const [waitingForResponse, setWaitingForResponse] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const usernameFieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (usernameFieldRef && usernameFieldRef.current && usernameFieldRef.current.focus) {
            usernameFieldRef.current.focus();
        }
    }, [usernameFieldRef]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const body = {
            username: username,
            password: password,
        };

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
                    Router.push(getValueOrFirst(Router.query.redirectUrl) ?? '/');
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

        setWaitingForResponse(true);
        setShowWrongPasswordError(false);
    };

    return (
        <div style={containerStyle}>
            <h1>Backstage2</h1>
            <Form action="/api/users/login" method="post" onSubmit={handleSubmit}>
                <FormGroup>
                    <FormControl
                        type="text"
                        placeholder="Användarnamn"
                        name="username"
                        ref={usernameFieldRef}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        type="password"
                        placeholder="Lösenord"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormGroup>
                {showWrongPasswordError ? <Alert variant="danger">Felaktigt användarnamn eller lösenord</Alert> : null}
                {showServerError ? (
                    <Alert variant="danger">
                        <strong>Serverfel</strong> Det gick inte att logga in, försök igen senare.
                    </Alert>
                ) : null}
                {waitingForResponse ? (
                    <Button variant="outline-primary" type="submit" disabled>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loggar in...
                    </Button>
                ) : (
                    <Button variant="outline-primary" type="submit">
                        Logga in
                    </Button>
                )}
            </Form>
        </div>
    );
};

export default LoginPage;
