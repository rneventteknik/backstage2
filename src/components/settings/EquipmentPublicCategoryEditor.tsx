import React from 'react';
import { Form } from 'react-bootstrap';
import { toIntOrUndefined } from '../../lib/utils';
import { EquipmentPublicCategory } from '../../models/interfaces';
import { FormNumberFieldWithoutScroll } from '../utils/FormNumberFieldWithoutScroll';

type Props = {
    entity: EquipmentPublicCategory;
    save: (x: EquipmentPublicCategory) => void;
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
            <Form.Group controlId="formColor">
                <Form.Label>Beskrivning</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    onChange={(e) => save({ ...entity, description: e.target.value })}
                    defaultValue={entity.description}
                />
            </Form.Group>
            <Form.Group controlId="formColor">
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

export default EquipmentPublicCategoryEditor;
