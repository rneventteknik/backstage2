import React from 'react';
import { Form } from 'react-bootstrap';
import { EquipmentTag } from '../../models/interfaces';
import EquipmentTagDisplay from '../utils/EquipmentTagDisplay';

type Props = {
    entity: EquipmentTag;
    readOnly?: boolean;
    save: (x: EquipmentTag) => void;
};

const EquipmentTagEditor: React.FC<Props> = ({ entity, save, readOnly = false }: Props) => {
    return (
        <>
            <Form.Group controlId="formName">
                <Form.Label>Namn</Form.Label>
                <Form.Control
                    type="text"
                    defaultValue={entity?.name}
                    readOnly={readOnly}
                    onChange={(e) => save({ ...entity, name: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="formIsPublic">
                <Form.Check
                    type="checkbox"
                    label="Visa i publika prislistan"
                    defaultChecked={entity?.isPublic ?? false}
                    disabled={readOnly}
                    onChange={(e) => save({ ...entity, isPublic: e.target.checked })}
                />
            </Form.Group>
            <Form.Group controlId="formColor">
                <Form.Label>Färg</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="#FF0000"
                    defaultValue={entity?.color}
                    readOnly={readOnly}
                    onChange={(e) => save({ ...entity, color: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="preview">
                <Form.Label>Förhandsgranskning</Form.Label>
                <p>
                    <EquipmentTagDisplay tag={entity} />
                </p>
            </Form.Group>
        </>
    );
};

export default EquipmentTagEditor;
