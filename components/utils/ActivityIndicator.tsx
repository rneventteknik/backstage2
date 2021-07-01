import React from 'react';
import { Spinner } from 'react-bootstrap';

const ActivityIndicator: React.FC = () => (
    <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
    </Spinner>
);

export default ActivityIndicator;
