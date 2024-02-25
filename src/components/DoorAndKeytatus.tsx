import { faKey, faLock, faLockOpen, faPlane, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import mqtt from 'mqtt';
import React, { useState, useEffect, useRef } from 'react';

const DoorAndKeyStatus: React.FC = () => {
    const [KeyInPlace, setKeyInPlace] = useState('unknown');
    const [Armed, setArmed] = useState('unknown');
    const mqttConnection = useRef<mqtt.MqttClient | null>(null);

    useEffect(() => {
        if (
            !process.env.NEXT_PUBLIC_MQTT_BROKER_URL ||
            !process.env.NEXT_PUBLIC_MQTT_BROKER_USER ||
            !process.env.NEXT_PUBLIC_MQTT_BROKER_PASS
        ) {
            throw 'Missing mqtt broker environmen variables';
        }

        const mqttOptions: mqtt.IClientOptions = {
            username: process.env.NEXT_PUBLIC_MQTT_BROKER_USER,
            password: process.env.NEXT_PUBLIC_MQTT_BROKER_PASS,
        };

        if (mqttConnection.current === null) {
            mqttConnection.current = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_BROKER_URL, mqttOptions);
        }

        mqttConnection.current.on('connect', () => {
            mqttConnection.current?.subscribe(['rn/nymble/3/door', 'rn/nymble/3/spånk/key'], (error) => {
                if (error) {
                    console.error('Error subscribing', error);
                }
            });
        });

        mqttConnection.current.on('error', (error) => {
            console.error('Mqtt connection error', error);
        });

        mqttConnection.current.on('message', (topic, message) => {
            try {
                const msg = JSON.parse(message.toString());

                if (topic === 'rn/nymble/3/door') {
                    if (msg.hasOwnProperty('status')) {
                        setArmed(msg['status']);
                    } else if (msg.hasOwnProperty('event')) {
                        setArmed(msg['event']);
                    }
                }
                if (topic === 'rn/nymble/3/spånk/key') {
                    if (msg.hasOwnProperty('status')) {
                        setKeyInPlace(msg['status']);
                    } else if (msg.hasOwnProperty('event')) {
                        setKeyInPlace(msg['event']);
                    }
                }
            } catch (error) {
                console.warn('Non json message received', error);
            }
        });

        return () => {
            mqttConnection.current?.end();
        };
    }, []);

    const getKeyIconAndText = (status: string) => {
        switch (status) {
            case 'away':
                return { icon: faPlane, text: 'Nyckeln är på vift' };

            case 'home':
                return { icon: faKey, text: 'Nyckeln är på sin plats' };

            default:
                return { icon: faQuestion, text: 'Status saknas' };
        }
    };

    const getArmedIconAndText = (status: string) => {
        switch (status) {
            case 'armed':
                return { icon: faLock, text: 'Dörren är larmad' };

            case 'disarmed':
                return { icon: faLockOpen, text: 'Dörren är olarmad' };

            default:
                return { icon: faQuestion, text: 'Status saknas' };
        }
    };

    return (
        <div>
            <FontAwesomeIcon
                id="keyStatusIcon"
                className="m-1"
                icon={getKeyIconAndText(KeyInPlace).icon}
                title={getKeyIconAndText(KeyInPlace).text}
            ></FontAwesomeIcon>
            <FontAwesomeIcon
                id="doorStatusIcon"
                className="m-1"
                icon={getArmedIconAndText(Armed).icon}
                title={getArmedIconAndText(Armed).text}
            ></FontAwesomeIcon>
        </div>
    );
};

export default DoorAndKeyStatus;
