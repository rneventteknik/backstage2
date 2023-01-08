import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Setting } from '../../../models/interfaces';

import RequiredIndicator from '../RequiredIndicator';

type Props = {
    setting: Partial<Setting> | null;
    onSubmit: () => void;
    onChange: (setting: Partial<Setting>) => void;
    hide: () => void;
    show: boolean;
};

const SettingsModal: React.FC<Props> = ({ setting, onSubmit, onChange, hide, show }: Props) => {
    return (
        <Modal show={show} onHide={hide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title> {setting?.id ? 'Redigera inställning' : 'Lägg till inställning'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="settingsForm" noValidate>
                    <Form.Group>
                        <Form.Label>Inställning</Form.Label>
                        <RequiredIndicator />
                        <Form.Control
                            type="text"
                            name="key"
                            defaultValue={setting?.key}
                            onChange={(e) => onChange({ ...setting, key: e.target.value })}
                            disabled={!!setting?.id}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Värde</Form.Label>
                        <RequiredIndicator />
                        <Form.Control
                            as="textarea"
                            name="value"
                            defaultValue={setting?.value}
                            onChange={(e) => onChange({ ...setting, value: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Kommentar</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            defaultValue={setting?.note}
                            onChange={(e) => onChange({ ...setting, note: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={hide}>
                    Avbryt
                </Button>
                <Button variant="primary" onClick={onSubmit} disabled={!setting?.key || !setting?.value}>
                    {setting?.id ? 'Uppdatera' : 'Lägg till'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SettingsModal;
