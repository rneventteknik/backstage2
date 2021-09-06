import { getPage } from 'next-page-tester';
import { fireEvent, screen } from '@testing-library/react';
import Router from 'next/router';

jest.mock('next/router', () => ({ push: jest.fn() }));

test('login page shows correctly', async () => {
    const { render } = await getPage({ route: '/' });
    render();

    expect(screen.queryByText(/Backstage2/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Användarnamn/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Lösenord/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Logga in' })).toBeInTheDocument();
});

test('login with incorrect password', async () => {
    const { render } = await getPage({ route: '/' });
    render();
    const usernameField = screen.getByPlaceholderText(/Användarnamn/);
    const passwordField = screen.getByPlaceholderText(/Lösenord/);
    const loginButton = screen.getByRole('button', { name: 'Logga in' });

    // Enter incorrect credentials
    fireEvent.change(usernameField, { target: { value: 'username' } });
    fireEvent.change(passwordField, { target: { value: 'incorrect-password' } });
    fireEvent.click(loginButton);

    // Verify that error message is shown
    expect(await screen.findByText(/Felaktigt användarnamn eller lösenord/, {})).toBeInTheDocument();
});

test('login with correct password', async () => {
    const { render } = await getPage({ route: '/' });
    render();
    const usernameField = screen.getByPlaceholderText(/Användarnamn/);
    const passwordField = screen.getByPlaceholderText(/Lösenord/);
    const loginButton = screen.getByRole('button', { name: 'Logga in' });

    // Enter correct credentials
    fireEvent.change(usernameField, { target: { value: 'username' } });
    fireEvent.change(passwordField, { target: { value: 'correct-password' } });
    fireEvent.click(loginButton);

    // Verify redirect to index
    expect(Router.push).toHaveBeenCalledWith('/');
});
