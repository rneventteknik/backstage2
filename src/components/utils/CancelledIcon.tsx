import React from 'react';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CancelledIcon: React.FC = () => {
    return (
        <span className="text-danger">
            <FontAwesomeIcon icon={faTimesCircle} className="ml-2" />
        </span>
    );
};

export default CancelledIcon;
