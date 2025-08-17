import { COLOR } from "constants/colors";
import React from "react";
import { BasicIconProps } from "./types";

export const CloseIcon: React.FC<BasicIconProps> = ({
  color = COLOR.BLACK,
  ...rest
}) => {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="-0.5 0 25 25"
      fill="none"
      {...rest}
    >
      <path
        d="M3 21.32L21 3.32001"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3.32001L21 21.32"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
