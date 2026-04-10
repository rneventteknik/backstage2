import React, { useState, ReactNode } from 'react';
import { Card } from '../ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

type Props = {
    title: string | ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
    headerContent?: ReactNode;
    className?: string;
};

const CollapsibleCard: React.FC<Props> = ({
    title,
    children,
    defaultOpen = true,
    headerContent,
    className = '',
}: Props) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card className={className}>
            <Card.Header
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                aria-expanded={isOpen}
            >
                <div className="flex items-center flex-grow">
                    <span className="flex-grow">{title}</span>
                    {headerContent && !isOpen && <span className="text-muted mr-2">{headerContent}</span>}
                </div>
                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} color="white" />
            </Card.Header>
            {isOpen && <div>{children}</div>}
        </Card>
    );
};

export default CollapsibleCard;
