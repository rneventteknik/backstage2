import { getPage } from 'next-page-tester';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { mockAdminUser } from '../../test-utils/mock-data';
import { mockWithSessionAdminFn } from '../../test-utils/mock-session';
import { mockRouter, mockRouterPushFn } from '../../test-utils/mock-router';

jest.mock('../../lib/session', () => mockWithSessionAdminFn);
jest.mock('next/router', () => mockRouter);

test('topbar and sidebar shows correctly', async () => {
    const { render } = await getPage({ route: '/' });

    render();

    // Verify search
    expect(screen.queryByPlaceholderText(/Sök\.\.\./)).toBeInTheDocument();

    // Verify sidebar
    expect(screen.queryByText(/Bokningar/)).toBeInTheDocument();
    expect(screen.queryByText(/Bokningsarkiv/)).toBeInTheDocument();
    expect(screen.queryByText(/Utrustning/)).toBeInTheDocument();
    expect(screen.queryByText(/Användare/)).toBeInTheDocument();
    expect(screen.queryByText(/Löner/)).toBeInTheDocument();
    expect(screen.queryByText(/Fakturor/)).toBeInTheDocument();
});

test('search works (no matches)', async () => {
    const { render } = await getPage({ route: '/' });
    render();
    const searchField = screen.getByPlaceholderText(/Sök/);

    // Enter text which will not match anyting
    fireEvent.change(searchField, { target: { value: 'no-matches' } });

    // Verify loading text
    await waitFor(() => expect(screen.queryAllByText(/Laddar/)).toHaveLength(3));

    // Verify correct result
    await waitFor(() => expect(screen.queryAllByText(/Inga matchingar/)).toHaveLength(3));
});

test('search works (matches + click)', async () => {
    const { render } = await getPage({ route: '/' });
    render();
    const searchField = screen.getByPlaceholderText(/Sök/);

    // Enter text which will match events and users
    fireEvent.change(searchField, { target: { value: 'has-matches' } });

    // Verify loading text
    await waitFor(() => expect(screen.queryAllByText(/Laddar/)).toHaveLength(3));

    // Verify correct result
    await waitFor(() => expect(screen.queryAllByText(/Inga matchingar/)).toHaveLength(1));
    await waitFor(() => expect(screen.queryByText(/Event 1/)).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText(/User 1/)).toBeInTheDocument());

    // Click user
    const user1ListItem = screen.getByText(/User 1/);
    fireEvent.click(user1ListItem);

    // Verify route change
    await waitFor(() => expect(mockRouterPushFn).toHaveBeenCalledWith('/users/100'));
});

test('user menu works', async () => {
    const { render } = await getPage({ route: '/' });
    render();
    const userMenuButton = screen.getByRole('button', { name: 'User Menu' });

    fireEvent.click(userMenuButton);

    expect(screen.queryByText(mockAdminUser.name as string)).toBeInTheDocument();
    expect(screen.queryByText('Logga ut')).toBeInTheDocument();
});
