import React, { useState } from 'react';
import { Button, Card, ListGroup } from 'react-bootstrap';
import { formatDatetimeForForm } from '../../lib/datetimeUtils';
import useSwr from 'swr';
import { FilesResult } from '../../models/misc/FilesResult';
import { getResponseContentOrError } from '../../lib/utils';
import {
    faAngleDown,
    faAngleUp,
    faExclamationCircle,
    faExternalLinkAlt,
    faFile,
    faFileExcel,
    faFileImage,
    faFileLines,
    faFilePdf,
    faFileWaveform,
    faFolder,
    faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSortedList } from '../../lib/sortIndexUtils';
import TableStyleLink from '../utils/TableStyleLink';
import Skeleton from 'react-loading-skeleton';
import { useNotifications } from '../../lib/useNotifications';
import { getDriveLink } from '../../lib/db-access/utils';

type Props = {
    driveFolderId: string;
    defaultFolderName: string;
    defaultParentFolder: string;
    onSubmit: (driveFolderId: string) => void;
    readonly?: boolean;
};

const FilesCard: React.FC<Props> = ({
    driveFolderId,
    defaultFolderName,
    defaultParentFolder,
    onSubmit,
    readonly = false,
}: Props) => {
    const [showContent, setShowContent] = useState(true);
    const { showErrorMessage } = useNotifications();

    const link = getDriveLink(driveFolderId);

    const createFolder = async (name: string, parentName: string) => {
        const body = {
            name,
            parentName,
        };

        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        await fetch('/api/files', request)
            .then((apiResponse) => getResponseContentOrError<string>(apiResponse))
            .then((driveFolderId) => onSubmit(driveFolderId))
            .catch((error: Error) => {
                console.error(error);
                showErrorMessage('Mappen kunde inte skapas');
            });
    };

    // Files list
    //
    if (driveFolderId === null || driveFolderId === '') {
        return (
            <>
                <Card className="mb-3">
                    <Card.Header className="d-flex">
                        <span className="flex-grow-1">Filer</span>
                        {!readonly ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => createFolder(defaultFolderName, defaultParentFolder)}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Skapa mapp
                            </Button>
                        ) : null}
                    </Card.Header>
                </Card>
            </>
        );
    }
    // Files list
    //
    return (
        <>
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1">Filer</span>
                    <Button className="mr-2" variant="" size="sm" onClick={() => setShowContent((x) => !x)}>
                        <FontAwesomeIcon icon={showContent ? faAngleUp : faAngleDown} />
                    </Button>
                    <Button variant="secondary" size="sm" href={link} target="_blank">
                        <FontAwesomeIcon icon={faExternalLinkAlt} /> Öppna i Google Drive
                    </Button>
                </Card.Header>
                {showContent ? <FilesCardList driveFolderId={driveFolderId} /> : null}
            </Card>
        </>
    );
};

type FilesCardListProps = {
    driveFolderId: string;
};

const FilesCardList: React.FC<FilesCardListProps> = ({ driveFolderId }: FilesCardListProps) => {
    const { data: list, error } = useSwr(`/api/files?driveFolderId=${driveFolderId}`, (url) =>
        fetch(url)
            .then((response) => getResponseContentOrError<FilesResult[]>(response))
            .then((list) =>
                list.map((x) => ({
                    ...x,
                    date: x.modifiedTime ? new Date(x.modifiedTime) : null,
                    sortIndex: x.modifiedTime ? -new Date(x.modifiedTime).getTime() : 0,
                    displayDate: x.modifiedTime ? formatDatetimeForForm(new Date(x.modifiedTime)) : '-',
                })),
            )
            .then((list) => getSortedList(list)),
    );

    // Error handling
    //
    if (error) {
        return (
            <div className="p-3">
                <p className="text-danger">
                    <FontAwesomeIcon icon={faExclamationCircle} /> Det gick inte att ladda filerna.
                </p>
                <p className="text-monospace text-muted mb-0">{error.message}</p>
            </div>
        );
    }

    // Loading skeleton
    //
    if (!list) {
        return <Skeleton height={150} className="mb-3" />;
    }

    // Files list
    //
    return (
        <ListGroup variant="flush">
            {list.map((file) => (
                <ListGroup.Item key={file.id}>
                    <div className="mb-1">
                        <TableStyleLink href={file.link ?? ''} target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={getIcon(file.mimeType)} className="mr-2" />
                            {file.name}
                        </TableStyleLink>
                    </div>
                    <div className="text-muted">{file.displayDate}</div>
                </ListGroup.Item>
            ))}
            {list.length === 0 ? (
                <ListGroup.Item className="text-center font-italic text-muted">
                    Ladda upp filer till Google Drive så visas de här.
                </ListGroup.Item>
            ) : null}
        </ListGroup>
    );
};

const getIcon = (mimeType: string | undefined) => {
    switch (mimeType) {
        case 'application/vnd.google-apps.folder':
            return faFolder;
        case 'application/vnd.google-apps.document':
            return faFileLines;
        case 'application/vnd.google-apps.spreadsheet':
            return faFileExcel;
        case 'application/pdf':
            return faFilePdf;
        case 'image/png':
            return faFileImage;
        case 'image/jpeg':
            return faFileImage;
        case 'audio/mpeg':
            return faFileWaveform;
        default:
            return faFile;
    }
};

export default FilesCard;
