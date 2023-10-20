import React from 'react';
import { Alert, Card, ListGroup } from 'react-bootstrap';
import { KeyValue } from '../models/interfaces/KeyValue';
import { getGlobalSetting } from '../lib/utils';
import { StatusTrackingData } from '../models/misc/StatusTrackingData';

type Props = {
    globalSettings: KeyValue[];
};

const StatusTrackingCard: React.FC<Props> = ({ globalSettings }: Props) => {
    try {
        const statusTracking = JSON.parse(
            getGlobalSetting('system.statusTracking', globalSettings),
        ) as StatusTrackingData;

        return (
            <Card className="mb-3">
                <Card.Header className="d-flex">
                    <span className="flex-grow-1">Status</span>
                </Card.Header>
                <ListGroup variant="flush">
                    {statusTracking.map((status) => (
                        <ListGroup.Item key={status.key} className="d-flex">
                            <div className="flex-grow-1">{status.label}</div>
                            <div>{status.value}</div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
        );
    } catch {
        return (
            <Alert className="" variant="danger">
                <strong>Error</strong> Invalid JSON in <code>system.statusTracking</code> setting
            </Alert>
        );
    }
};

export default StatusTrackingCard;
