import { COLOR } from "constants/colors";
import React from "react";
import { BasicIconProps } from "./types";

export const DeleteIcon: React.FC<BasicIconProps> = ({
  color = COLOR.WHITE,
  ...rest
}) => {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill='none'
      {...rest}
    >
    <path
      stroke={COLOR.WHITE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7h16M6 7v11a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9V5Z"
    />
    </svg>
  );
};
