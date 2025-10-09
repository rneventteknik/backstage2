import React from 'react';
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Placement } from 'react-bootstrap/esm/Overlay';

type WarningIconProps = {
    text: string;
    placement?: Placement;
    className: string;
};

const WarningIcon: React.FC<WarningIconProps> = ({ text, placement = "right", className }: WarningIconProps) => (
    <OverlayTrigger
        placement={placement}
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