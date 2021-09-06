import { getPage } from 'next-page-tester';
import { screen } from '@testing-library/react';
import { mockWithSessionAdminFn } from '../../test-utils/mock-session';

jest.mock('../../lib/session', () => mockWithSessionAdminFn);

test('home matches snapshot', async () => {
    const { render } = await getPage({ route: '/' });

    render();

    expect(screen.getAllByTestId('main-content')).toMatchSnapshot();
});

test('about matches snapshot', async () => {
    const { render } = await getPage({ route: '/about' });

    render();

    expect(screen.getAllByTestId('main-content')).toMatchSnapshot();
});

test('no-access matches snapshot', async () => {
    const { render } = await getPage({ route: '/no-access' });

    render();

    expect(screen.getAllByTestId('main-content')).toMatchSnapshot();
});
