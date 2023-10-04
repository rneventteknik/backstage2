import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { getGlobalSetting } from '../../lib/utils';
import { KeyValue } from '../../models/interfaces/KeyValue';

type Props = {
    currentUser: CurrentUserInfo;
    globalSettings: KeyValue[];
};

const LoggedOutModal: React.FC<Props> = ({ currentUser, globalSettings }: Props) => {
    const [hideModal, setHideModal] = useState(false);
    const [date, setDate] = useState(Date.now());

    useEffect(() => {
        // Update time every 15s
        const timer = setInterval(() => setDate(Date.now()), 150);
        return function cleanup() {
            clearInterval(timer);
        };
    }, []);

    // 15 min
    const timeBeforeLogOutToShowModal = 15 * 60 * 1000;

    const maxSessionLength = parseInt(getGlobalSetting('config.maxSessionLength', globalSettings, '0'));
    const logOutDatetime = (currentUser.loginDate ?? 0) + maxSessionLength;
    const isSoonLoggedOut = maxSessionLength > 0 && logOutDatetime - timeBeforeLogOutToShowModal < date;

    const minutesToLogOut = Math.round(((currentUser.loginDate ?? 0) + maxSessionLength - date) / 1000 / 60);

    return !hideModal && isSoonLoggedOut ? (
        <Modal show={true}>
            <Modal.Header>
                <Modal.Title>Snart utloggad</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Din session går snart ut, vänligen spara ditt arbete och logga in igen. Du loggas ut om{' '}
                    {minutesToLogOut} minuter.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => setHideModal(true)}>
                    Jag förstår
                </Button>
            </Modal.Footer>
        </Modal>
    ) : null;
};

export default LoggedOutModal;
