import { faAngleUp, faAngleDown, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EditTextModal from './utils/EditTextModal';

type Props = {
    text: string;
    onSubmit: (text: string) => void;
    cardTitle: string;
    editModelTitle?: string;
};

const MarkdownCard: React.FC<Props> = ({ text, onSubmit, cardTitle, editModelTitle }: Props) => {
    const [showEditTextModal, setShowEditTextModal] = useState(false);
    const [showContent, setShowContent] = useState(true);

    return (
        <>
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1">{cardTitle}</span>
                    {text ? (
                        <Button className="mr-2" variant="" size="sm" onClick={() => setShowContent((x) => !x)}>
                            <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                        </Button>
                    ) : null}
                    <Button variant="secondary" size="sm" onClick={() => setShowEditTextModal(true)}>
                        <FontAwesomeIcon icon={text ? faPen : faPlus} /> {text ? 'Redigera' : 'Skapa'}
                    </Button>
                </Card.Header>
                {showContent && text ? (
                    <Card.Body>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                    </Card.Body>
                ) : null}
            </Card>
            <EditTextModal
                text={text}
                onSubmit={onSubmit}
                hide={() => setShowEditTextModal(false)}
                show={showEditTextModal}
                modalTitle={editModelTitle ?? 'Redigera'}
                modalConfirmText={'Spara'}
            />
        </>
    );
};

export default MarkdownCard;
