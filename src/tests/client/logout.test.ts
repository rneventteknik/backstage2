import { getPage } from 'next-page-tester';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { mockWithSessionAdminFn } from '../../test-utils/mock-session';
import { mockRouter, mockRouterPushFn } from '../../test-utils/mock-router';

jest.mock('../../lib/session', () => mockWithSessionAdminFn);
jest.mock('next/router', () => mockRouter);

test('redirect from login page when authenticated', async () => {
    const { render } = await getPage({ route: '/login' });
    render();

    // Verify that we are logged in by checking that the search bar is available
    expect(screen.queryByPlaceholderText(/Sök\.\.\./)).toBeInTheDocument();
});

test('logout works', async () => {
    const { render } = await getPage({ route: '/' });
    render();

    // Click menu
    const userMenuButton = screen.getByRole('button', { name: 'User Menu' });
    fireEvent.click(userMenuButton);

    // Click logout
    const logoutButton = screen.getByText('Logga ut');
    fireEvent.click(logoutButton);

    // Verify redirect to logout
    await waitFor(() => expect(mockRouterPushFn).toHaveBeenCalledWith('/login'));
});
