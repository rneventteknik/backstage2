import Image from 'next/image';
import React, { useState } from 'react';
import { Card } from 'react-bootstrap';

export const ImageCardHideOnError = ({ src, altText }: { src: string; altText: string }) => {
    const [hide, setHide] = useState(false);

    if (hide) {
        return null;
    }

    return (
        <Card className="mb-3">
            <Card.Header>
                <div style={{ height: '250px', width: '100%' }}>
                    <Image
                        src={src}
                        alt={altText}
                        className="p-4"
                        style={{ objectFit: 'contain' }}
                        fill={true}
                        onError={() => {
                            setHide(true);
                        }}
                    />
                </div>
            </Card.Header>
        </Card>
    );
};

export const ImageHideOnError = ({ src, altText }: { src: string; altText: string }) => {
    const [hide, setHide] = useState(false);

    if (hide) {
        return null;
    }

    return (
        <div className="position-relative">
            <div style={{ height: '75px', width: '100%' }}>
                <Image
                    src={src}
                    alt={altText}
                    style={{ objectFit: 'contain' }}
                    fill={true}
                    onError={() => {
                        setHide(true);
                    }}
                />
            </div>
        </div>
    );
};
