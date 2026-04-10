import React from 'react';

const ActivityIndicator: React.FC = () => (
    <div
        className="inline-block w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin"
        role="status"
        aria-label="Loading"
    />
);

export default ActivityIndicator;
