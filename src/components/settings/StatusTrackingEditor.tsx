import React from 'react';
import { Form } from 'react-bootstrap';
import { StatusTracking } from '../../models/interfaces/StatusTracking';
import { formatDatetime } from '../../lib/datetimeUtils';

type Props = {
    entity: StatusTracking;
    save: (x: StatusTracking) => void;
};

const EquipmentPublicCategoryEditor: React.FC<Props> = ({ entity, save }: Props) => {
    return (
        <>
            <Form.Group controlId="formName">
                <Form.Label>Namn</Form.Label>
                <Form.Control
                    type="text"
                    defaultValue={entity?.name}
                    onChange={(e) => save({ ...entity, name: e.target.value })}
                />
            </Form.Group>

            <Form.Group controlId="formName">
                <Form.Label>Nyckel</Form.Label>
                <Form.Control
                    type="text"
                    defaultValue={entity?.key}
                    onChange={(e) => save({ ...entity, key: e.target.value })}
                />
            </Form.Group>

            <Form.Group controlId="formName">
                <Form.Label>Nuvarande värde</Form.Label>
                <Form.Control
                    type="text"
                    defaultValue={entity?.value}
                    onChange={(e) => save({ ...entity, value: e.target.value })}
                />
                <Form.Text className="text-muted">
                    Detta värde uppdateras när statusen ändras från andra system.
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="formName">
                <Form.Label>Uppdaterad senast</Form.Label>
                <Form.Control
                    type="text"
                    readOnly
                    defaultValue={formatDatetime(entity?.lastStatusUpdate)}
                    onChange={(e) => save({ ...entity, value: e.target.value })}
                />
                <Form.Text className="text-muted">
                    Detta värde uppdateras när statusen ändras från andra system.
                </Form.Text>
            </Form.Group>
        </>
    );
};

export default EquipmentPublicCategoryEditor;
