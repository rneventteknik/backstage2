import React, { useState } from 'react';
import { Alert, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { KeyValue } from '../../../models/interfaces/KeyValue';
import { getGlobalSetting } from '../../../lib/utils';

type DiscountPreset = {
    label: string;
    value: number;
};

type Props = {
    show: boolean;
    hide: () => void;
    onSubmit: (value: number) => void;
    discountPercentage: number;
    globalSettings: KeyValue[];
};

const isValidDiscount = (text: string) => {
    const n = parseInt(text, 10);
    return !isNaN(n) && n >= 0 && n <= 100;
};

const EditDiscountModal: React.FC<Props> = ({ show, hide, onSubmit, discountPercentage, globalSettings }: Props) => {
    const [value, setValue] = useState(discountPercentage.toString());

    let presets: DiscountPreset[] = [];
    let hasPresetError = false;
    try {
        presets = JSON.parse(getGlobalSetting('booking.discountPresets', globalSettings, '[]')) as DiscountPreset[];
    } catch {
        hasPresetError = true;
    }

    const onCancel = () => {
        setValue(discountPercentage.toString());
        hide();
    };

    const onConfirm = () => {
        hide();
        onSubmit(Math.min(100, Math.max(0, parseInt(value, 10))));
    };

    return (
        <Modal show={show} onHide={onCancel} size="sm" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Redigera rabatt</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {hasPresetError ? (
                    <Alert variant="danger" className="mb-3">
                        <strong>Fel</strong> Ogiltig JSON i inställningen <code>booking.discountPresets</code>
                    </Alert>
                ) : null}
                {presets.length > 0 ? (
                    <div className="mb-3">
                        {presets.map((preset) => (
                            <Button
                                key={preset.label}
                                variant="secondary"
                                className="d-block w-100 mb-2"
                                onClick={() => {
                                    hide();
                                    onSubmit(preset.value);
                                }}
                            >
                                {preset.label} ({preset.value}%)
                            </Button>
                        ))}
                    </div>
                ) : null}
                <hr />
                <InputGroup>
                    <Form.Control
                        type="number"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Avbryt
                </Button>
                <Button variant="primary" onClick={onConfirm} disabled={!isValidDiscount(value)}>
                    Spara
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditDiscountModal;
