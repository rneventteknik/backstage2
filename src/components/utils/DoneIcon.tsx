import React from 'react';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DoneIcon: React.FC = () => {
    return (
        <span className="text-success">
            <FontAwesomeIcon icon={faCircleCheck} className="ml-2" />
        </span>
    );
};

export default DoneIcon;
