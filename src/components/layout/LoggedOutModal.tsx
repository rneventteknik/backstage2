import React, { useEffect, useState } from 'react';
import { CurrentUserInfo } from '../../models/misc/CurrentUserInfo';
import { getGlobalSetting } from '../../lib/utils';
import { KeyValue } from '../../models/interfaces/KeyValue';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../ui/Modal';

type Props = {
    currentUser: CurrentUserInfo;
    globalSettings: KeyValue[];
};

const LoggedOutModal: React.FC<Props> = ({ currentUser, globalSettings }: Props) => {
    const [hideModal, setHideModal] = useState(false);
    const [date, setDate] = useState(Date.now());
    const router = useRouter();

    useEffect(() => {
        // Update time every 15s
        const timer = setInterval(() => setDate(Date.now()), 150);
        return function cleanup() {
            clearInterval(timer);
        };
    }, []);

    const logOut = async () => {
        const res = await fetch('/api/users/logout');
        if (res.status === 200) {
            router.push(loginPageUrl);
        }
    };

    // 15 min
    const timeBeforeLogOutToShowModal = 15 * 60 * 1000;

    const maxSessionLength = parseInt(getGlobalSetting('config.maxSessionLength', globalSettings, '0'));
    const logOutDatetime = (currentUser.loginDate ?? 0) + maxSessionLength;
    const isSoonLoggedOut = maxSessionLength > 0 && logOutDatetime - timeBeforeLogOutToShowModal < date;
    const isLoggedOut = maxSessionLength > 0 && logOutDatetime < date;

    const minutesToLogOut = Math.round(((currentUser.loginDate ?? 0) + maxSessionLength - date) / 1000 / 60);
    const loginPageUrl = '/login?redirectUrl=' + router.asPath;

    return (!hideModal && isSoonLoggedOut) || isLoggedOut ? (
        <Modal show={true} backdrop="static">
            <ModalHeader>
                <ModalTitle>{isLoggedOut ? 'Utloggad' : 'Snart utloggad'}</ModalTitle>
            </ModalHeader>
            <ModalBody>
                <p>
                    {isLoggedOut ? (
                        <p>Du är nu utloggad, vänligen logga in igen.</p>
                    ) : (
                        <p>
                            Din session går snart ut, vänligen spara ditt arbete och logga in igen. Du loggas ut om{' '}
                            {minutesToLogOut} minuter.
                        </p>
                    )}
                </p>
                <p></p>
            </ModalBody>

            <ModalFooter>
                {isLoggedOut ? (
                    <Link href={loginPageUrl} passHref>
                        <Button variant="primary" as="span">
                            Logga in igen
                        </Button>
                    </Link>
                ) : (
                    <>
                        <Button variant="secondary" onClick={logOut}>
                            Logga ut
                        </Button>
                        <Button variant="primary" onClick={() => setHideModal(true)}>
                            Jag förstår
                        </Button>
                    </>
                )}
            </ModalFooter>
        </Modal>
    ) : null;
};

export default LoggedOutModal;
