import React from 'react';
import { Form } from 'react-bootstrap';
import { toIntOrUndefined } from '../../lib/utils';
import { EquipmentLocation } from '../../models/interfaces/EquipmentLocation';
import { FormNumberFieldWithoutScroll } from '../utils/FormNumberFieldWithoutScroll';

type Props = {
    entity: EquipmentLocation;
    save: (x: EquipmentLocation) => void;
};

const EquipmentLocationEditor: React.FC<Props> = ({ entity, save }: Props) => {
    return (
        <>
            <Form.Group controlId="formName">
                <Form.Label>Namn</Form.Label>
                <Form.Control
                    required
                    type="text"
                    defaultValue={entity?.name}
                    onChange={(e) => save({ ...entity, name: e.target.value })}
                />
            </Form.Group>
            <Form.Group controlId="formSortIndex">
                <Form.Label>Sort Index</Form.Label>
                <FormNumberFieldWithoutScroll
                    type="number"
                    min="0"
                    value={entity.sortIndex}
                    onChange={(e) =>
                        save({
                            ...entity,
                            sortIndex: toIntOrUndefined(e.target.value) ?? 0,
                        })
                    }
                />
            </Form.Group>
        </>
    );
};

export default EquipmentLocationEditor;
