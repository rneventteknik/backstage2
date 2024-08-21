import React, { useEffect } from 'react';
import { Button, Form, ListGroup, Modal } from 'react-bootstrap';
import { Language } from '../../../models/enums/Language';
import { EquipmentPackage } from '../../../models/interfaces';
import PackageEquipmentList from '../../equipmentPackage/PackageEquipmentList';
import MarkdownCard from '../../MarkdownCard';

type Props = {
    show: boolean;
    onHide: () => void;
    onSave: () => void;
    equipmentPackage: EquipmentPackage;
    language: Language;
};

const PackageInfoModal: React.FC<Props> = ({ show, onHide, onSave, equipmentPackage, language }: Props) => {
    // Register an event listener to save on enter
    //
    useEffect(() => {
        const eventListener = (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter') {
                event.preventDefault();
                onSave();
            }
        };
        document.addEventListener('keydown', eventListener);
        return () => {
            document.removeEventListener('keydown', eventListener);
        };
    }, [onSave]);

    return (
        <Modal show={show} onHide={() => onHide()} backdrop="static">
            <Form>
                <Modal.Header>
                    <Modal.Title>Lägg till utrustning från paket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PackageEquipmentList equipmentPackage={equipmentPackage} language={language} />
                    <hr />
                    <ListGroup>
                        {equipmentPackage.estimatedHours && equipmentPackage.estimatedHours > 0 ? (
                            <ListGroup.Item className="d-flex">
                                <span className="flex-grow-1">Estimerad arbetstid</span>
                                <span>{equipmentPackage.estimatedHours} timmar</span>
                            </ListGroup.Item>
                        ) : null}
                        <ListGroup.Item className="d-flex">
                            <span className="flex-grow-1">Pakettyp</span>
                            <span>{equipmentPackage.addAsHeading ? 'Rubrik med rader' : 'Individuella rader'}</span>
                        </ListGroup.Item>
                    </ListGroup>
                    {equipmentPackage.note && equipmentPackage.note.length > 0 ? (
                        <>
                            <hr />
                            <MarkdownCard
                                text={equipmentPackage.note}
                                readonly={true}
                                cardTitle="Paketanteckningar"
                                onSubmit={() => false}
                            />
                        </>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => onHide()}>
                        Avbryt
                    </Button>
                    <Button variant="primary" type="submit" onClick={() => onSave()} autoFocus>
                        Lägg till
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default PackageInfoModal;
