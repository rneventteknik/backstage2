import React from 'react';
import { ErrorPageContent } from '../components/layout/ErrorPage';

const Error500Page: React.FC = () => <ErrorPageContent errorMessage="Error 500: Server error" />;

export default Error500Page;
