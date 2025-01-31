import { faEyeSlash, faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { getSortedList } from '../../lib/sortIndexUtils';
import { Language } from '../../models/enums/Language';
import { EquipmentPackage } from '../../models/interfaces';

type Props = {
    equipmentPackage: EquipmentPackage;
    language?: Language;
};

const PackageEquipmentList: React.FC<Props> = ({ equipmentPackage, language = Language.SV }: Props) => {
    return (
        <ListGroup variant="flush">
            {getSortedList(equipmentPackage.equipmentEntries).map((e) => (
                <ListGroup.Item key={e.id} className="d-flex">
                    <span className="flex-grow-1">
                        {language == Language.SV ? e.equipment?.name : e.equipment?.nameEN}
                        {!!(language == Language.SV ? e.equipment?.description : e.equipment?.descriptionEN) ? (
                            <p className="text-muted  mb-0">
                                {language == Language.SV ? e.equipment?.description : e.equipment?.descriptionEN}
                            </p>
                        ) : null}
                        {e.equipmentPrice ? <p className="text-muted mb-0">{e.equipmentPrice.name}</p> : null}
                    </span>
                    <span>
                        {e.isHidden ? (
                            <FontAwesomeIcon icon={faEyeSlash} className="mr-1" title="Gömd för kund" />
                        ) : null}
                        {e.isFree ? <FontAwesomeIcon icon={faCoins} className="mr-1" title="Utan pris" /> : null}
                        {e.numberOfUnits != 1 || e.numberOfHours == 0 ? <>{e.numberOfUnits} st</> : null}
                        {e.numberOfUnits != 1 && e.numberOfHours != 0 ? <> / </> : null}
                        {e.numberOfHours > 0 ? <>{e.numberOfHours} h</> : null}
                    </span>
                </ListGroup.Item>
            ))}

            {equipmentPackage.equipmentEntries?.length === 0 ? (
                <ListGroup.Item className="text-center font-italic text-muted">
                    Det här paketet har ingen utrustning
                </ListGroup.Item>
            ) : null}
        </ListGroup>
    );
};

export default PackageEquipmentList;
