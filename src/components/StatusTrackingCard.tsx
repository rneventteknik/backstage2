import React from 'react';
import { Card, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { KeyValue } from '../models/interfaces/KeyValue';
import { getGlobalSetting, toIntOrUndefined } from '../lib/utils';
import { faExclamationCircle, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDatetime } from '../lib/datetimeUtils';
import { statusTrackingsFetcher } from '../lib/fetchers';
import useSwr from 'swr';
import { StatusTracking } from '../models/interfaces/StatusTracking';
import Skeleton from 'react-loading-skeleton';

type Props = {
    globalSettings: KeyValue[];
};

const StatusTrackingCard: React.FC<Props> = ({ globalSettings }: Props) => {
    const { data: statusTrackings, error } = useSwr('/api/statusTracking', statusTrackingsFetcher);

    const timeBeforeObsolete =
        toIntOrUndefined(getGlobalSetting('statusTracking.timeBeforeObsolete', globalSettings, '3600000')) ?? 3600000;

    const statusIsObsolete = (status: StatusTracking) =>
        !status.lastStatusUpdate || new Date(status.lastStatusUpdate).getTime() + timeBeforeObsolete < Date.now();

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

    if (!statusTrackings) {
        return <Skeleton />;
    }

    if (statusTrackings.length === 0) {
        return null;
    }

    return (
        <Card className="mb-3">
            <Card.Header className="d-flex">
                <span className="flex-grow-1">Status</span>
            </Card.Header>
            <ListGroup variant="flush">
                {statusTrackings.map((statusTracking) =>
                    statusIsObsolete(statusTracking) ? (
                        <ListGroup.Item key={statusTracking.key} className="d-flex">
                            <div className="flex-grow-1">
                                {statusTracking.name}{' '}
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip id="1">
                                            Denna status uppdaterades senast{' '}
                                            {statusTracking.lastStatusUpdate
                                                ? formatDatetime(new Date(statusTracking.lastStatusUpdate))
                                                : 'N/A'}{' '}
                                            och är kanske inte längre aktuell.
                                        </Tooltip>
                                    }
                                >
                                    <FontAwesomeIcon className="ml-1" icon={faTriangleExclamation} />
                                </OverlayTrigger>
                            </div>
                            <div className="text-muted">{statusTracking.value}</div>
                        </ListGroup.Item>
                    ) : (
                        <ListGroup.Item key={statusTracking.key} className="d-flex">
                            <div className="flex-grow-1">{statusTracking.name}</div>
                            <div>{statusTracking.value}</div>
                        </ListGroup.Item>
                    ),
                )}
            </ListGroup>
        </Card>
    );
};

export default StatusTrackingCard;
