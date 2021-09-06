import '@testing-library/jest-dom';
import { server } from './test-utils/server';

// This ensures we can use `window.fetch()` in our Jest tests.
require('whatwg-fetch');

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());