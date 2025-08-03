import { faDoorClosed, faDoorOpen, faKey, faLock, faLockOpen, faPlane, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import mqtt from 'mqtt';
import React, { useState, useEffect, useRef } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { KeyValue } from '../models/interfaces/KeyValue';
import { getGlobalSetting } from '../lib/utils';

type Props = {
    globalSettings: KeyValue[];
};
const DoorAndKeyStatus: React.FC<Props> = ({ globalSettings }: Props) => {
    if (!process.env.NEXT_PUBLIC_MQTT_BROKER_URL) {
        return null;
    }

    return <DoorAndKeyStatusContent globalSettings={globalSettings} />;
}

type DoorAndKeyStatusContentProps = {
    globalSettings: KeyValue[];
};
const DoorAndKeyStatusContent: React.FC<DoorAndKeyStatusContentProps> = ({ globalSettings }: DoorAndKeyStatusContentProps) => {
    const [KeyInPlace, setKeyInPlace] = useState('unknown');
    const [Armed, setArmed] = useState('unknown');
    const [Door, setDoor] = useState('unknown');
    const mqttConnection = useRef<mqtt.MqttClient | null>(null);

    const keyTopic = getGlobalSetting('mqtt.keyTopic', globalSettings, '');
    const doorTopic = getGlobalSetting('mqtt.doorTopic', globalSettings, '');
    const alarmTopic = getGlobalSetting('mqtt.alarmTopic', globalSettings, '');

    useEffect(() => {
        fetch('api/auth/mqtt-credentials').then(async (response) => {
            const credentials = await response.json();

            if (!credentials.username || !credentials.password || !process.env.NEXT_PUBLIC_MQTT_BROKER_URL) {
                throw 'Missing required mqtt broker parameters';
            }

            const mqttOptions: mqtt.IClientOptions = {
                username: credentials.username,
                password: credentials.password,
            };

            if (mqttConnection.current === null) {
                mqttConnection.current = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_BROKER_URL, mqttOptions);
            }

            mqttConnection.current.on('connect', () => {
                mqttConnection.current?.subscribe([keyTopic, doorTopic, alarmTopic], (error) => {
                    if (error) {
                        console.error('Error subscribing', error);
                    }
                });
            });

            mqttConnection.current.on('error', (error) => {
                console.error('Mqtt connection error', error);
            });

            mqttConnection.current.on('message', (topic, messageString) => {
                try {
                    const parsedMessage = JSON.parse(messageString.toString());
                    const status = parsedMessage.hasOwnProperty('status') ? parsedMessage['status'] : null;
                    const event = parsedMessage.hasOwnProperty('event') ? parsedMessage['event'] : null;
                    const result = status ?? event;


                    if (topic === keyTopic) {
                        setKeyInPlace(result);
                    }
                    if (topic === doorTopic) {
                        setDoor(result);
                    }
                    if (topic === alarmTopic) {
                        setArmed(result);
                    }

                } catch (error) {
                    console.warn('Non json message received', error);
                }
            });
        });

        return () => {
            mqttConnection.current?.end();
        };
    }, [alarmTopic, doorTopic, keyTopic]);

    const getKeyIconAndText = (status: string) => {
        switch (status) {
            case 'away':
                return { icon: faPlane, text: 'Nyckeln är på vift' };

            case 'home':
                return { icon: faKey, text: 'Nyckeln är på sin plats' };

            default:
                return { icon: faQuestion, text: 'Nyckelstatus saknas' };
        }
    };

    const getDoorIconAndText = (status: string) => {
        switch (status) {
            case 'open':
                return { icon: faDoorOpen, text: 'Dörren är öppen' };

            case 'closed':
                return { icon: faDoorClosed, text: 'Dörren är stängd' };

            default:
                return { icon: faQuestion, text: 'Dörrstatus saknas' };
        }
    };

    const getAlarmIconAndText = (status: string) => {
        switch (status) {
            case 'armed':
                return { icon: faLock, text: 'Dörren är larmad' };

            case 'disarmed':
                return { icon: faLockOpen, text: 'Dörren är olarmad' };

            default:
                return { icon: faQuestion, text: 'Larmstatus saknas' };
        }
    };

    return (
        <Card className="mb-3">
            <Card.Header className="d-flex">
                <span className="flex-grow-1">Nyckel- och dörrstatus</span>
            </Card.Header>
            <ListGroup>
                <ListGroup.Item>
                    <FontAwesomeIcon
                        id="keyStatusIcon"
                        className="mr-2 fa-fw"
                        icon={getKeyIconAndText(KeyInPlace).icon}
                    />
                    <span>{getKeyIconAndText(KeyInPlace).text}</span>
                </ListGroup.Item>
                <ListGroup.Item>
                    <FontAwesomeIcon
                        id="doorStatusIcon"
                        className="mr-2 fa-fw "
                        icon={getDoorIconAndText(Door).icon}
                    />
                    <span>{getDoorIconAndText(Door).text}</span>
                </ListGroup.Item>
                <ListGroup.Item>
                    <FontAwesomeIcon
                        id="alarmStatusIcon"
                        className="mr-2 fa-fw "
                        icon={getAlarmIconAndText(Armed).icon}
                    />
                    <span>{getAlarmIconAndText(Armed).text}</span>
                </ListGroup.Item>
            </ListGroup>
        </Card>
    );
};

export default DoorAndKeyStatus;
