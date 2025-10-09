import React from 'react';
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

type WarningIconProps = {
    text: string;
    className: string;
};

const WarningIcon: React.FC<WarningIconProps> = ({ text, className }: WarningIconProps) => (
    <OverlayTrigger
        placement="right"
        overlay={
            <Tooltip id="1">
                <strong>{text}</strong>
            </Tooltip>
        }
    >
        <FontAwesomeIcon className={className} icon={faWarning} />
    </OverlayTrigger>
);

export default WarningIcon;