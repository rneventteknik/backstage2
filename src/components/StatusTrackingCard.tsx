import React from 'react';
import { Alert, Card, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { KeyValue } from '../models/interfaces/KeyValue';
import { getGlobalSetting, toIntOrUndefined } from '../lib/utils';
import { StatusTrackingData, StatusTrackingStatus } from '../models/misc/StatusTrackingData';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDatetime } from '../lib/datetimeUtils';

type Props = {
    globalSettings: KeyValue[];
};

const StatusTrackingCard: React.FC<Props> = ({ globalSettings }: Props) => {
    try {
        const statusTracking = JSON.parse(
            getGlobalSetting('system.statusTracking', globalSettings, '[]'),
        ) as StatusTrackingData;
        const timeBeforeObsolete =
            toIntOrUndefined(getGlobalSetting('system.statusTracking.timeBeforeObsolete', globalSettings, '3600000')) ??
            3600000;

        const statusIsObsolete = (status: StatusTrackingStatus) =>
            !status.updated || new Date(status.updated).getTime() + timeBeforeObsolete < Date.now();

        if (statusTracking.length === 0) {
            return null;
        }

        return (
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1">Status</span>
                </Card.Header>
                <ListGroup variant="flush">
                    {statusTracking.map((status) =>
                        statusIsObsolete(status) ? (
                            <ListGroup.Item key={status.key} className="d-flex">
                                <div className="flex-grow-1">
                                    {status.label}{' '}
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id="1">
                                                Denna status uppdaterades senast{' '}
                                                {status.updated ? formatDatetime(new Date(status.updated)) : 'N/A'} och
                                                är kanske inte längre aktuell.
                                            </Tooltip>
                                        }
                                    >
                                        <FontAwesomeIcon className="ml-1" icon={faTriangleExclamation} />
                                    </OverlayTrigger>
                                </div>
                                <div className="text-muted">{status.value}</div>
                            </ListGroup.Item>
                        ) : (
                            <ListGroup.Item key={status.key} className="d-flex">
                                <div className="flex-grow-1">{status.label}</div>
                                <div>{status.value}</div>
                            </ListGroup.Item>
                        ),
                    )}
                </ListGroup>
            </Card>
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return (
            <Alert className="" variant="danger">
                <p className="mb-0">
                    <strong>Error</strong> Status kunde inte laddas.
                </p>
                <code>{error.message}</code>
            </Alert>
        );
    }
};

export default StatusTrackingCard;
