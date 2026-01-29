import { faEyeSlash, faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { getSortedList } from '../../lib/sortIndexUtils';
import { Language } from '../../models/enums/Language';
import { ConnectedEquipmentEntry } from '../../models/interfaces/Equipment';
import TableStyleLink from '../utils/TableStyleLink';

type Props = {
    connectedEquipment: ConnectedEquipmentEntry[];
    language?: Language;
};

const ConnectedEquipmentList: React.FC<Props> = ({ connectedEquipment, language = Language.SV }: Props) => {
    return (
        <ListGroup variant="flush">
            {getSortedList(connectedEquipment).map((e) => (
                <ListGroup.Item key={e.id} className="d-flex">
                    <span className="flex-grow-1">
                        <TableStyleLink href={'/equipment/' + e.connectedEquipmentId} className="mr-1">
                            {language == Language.SV ? e.connectedEquipment?.name : e.connectedEquipment?.nameEN}
                        </TableStyleLink>
                        {!!(language == Language.SV
                            ? e.connectedEquipment?.description
                            : e.connectedEquipment?.descriptionEN) ? (
                            <p className="text-muted  mb-0">
                                {language == Language.SV
                                    ? e.connectedEquipment?.description
                                    : e.connectedEquipment?.descriptionEN}
                            </p>
                        ) : null}
                        {e.equipmentPrice ? <p className="text-muted mb-0">{e.equipmentPrice.name}</p> : null}
                    </span>
                    <span>
                        {e.isHidden ? (
                            <FontAwesomeIcon icon={faEyeSlash} className="mr-1" title="Gömd för kund" />
                        ) : null}
                        {e.isFree ? <FontAwesomeIcon icon={faCoins} className="mr-1" title="Utan pris" /> : null}
                    </span>
                </ListGroup.Item>
            ))}

            {connectedEquipment?.length === 0 ? (
                <ListGroup.Item className="text-center font-italic text-muted">
                    Ingen relaterad utrustning
                </ListGroup.Item>
            ) : null}
        </ListGroup>
    );
};

export default ConnectedEquipmentList;
