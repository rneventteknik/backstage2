import React, { useState, ReactNode } from 'react';
import { Card, Collapse } from 'react-bootstrap';
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
                className="d-flex justify-content-between align-items-center"
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                aria-expanded={isOpen}
                style={{ cursor: 'pointer', userSelect: 'none' }}
            >
                <div className="d-flex align-items-center flex-grow-1">
                    <span className="flex-grow-1">{title}</span>
                    {headerContent && !isOpen && <span className="text-muted me-2">{headerContent}</span>}
                </div>
                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-primary" />
            </Card.Header>
            <Collapse in={isOpen}>
                <div>{children}</div>
            </Collapse>
        </Card>
    );
};

export default CollapsibleCard;
