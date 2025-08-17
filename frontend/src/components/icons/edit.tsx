import { COLOR } from "constants/colors";
import React from "react";
import { BasicIconProps } from "./types";

export const EditIcon: React.FC<BasicIconProps> = ({
  color = COLOR.WHITE,
  ...rest
}) => {
  return (
    <svg
      width="24px"
      height="24px"
      fill='none'
      {...rest}
    >
    <path
      stroke={COLOR.WHITE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.8 16.4v4.4a2.2 2.2 0 0 1-2.2 2.2H3.2A2.2 2.2 0 0 1 1 20.8V5.4a2.2 2.2 0 0 1 2.2-2.2h4.4"
      />
    <path
      stroke={COLOR.WHITE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12.55 16.18 23 5.62 18.38 1 7.93 11.45 7.6 16.4l4.95-.22Z"
    />
    </svg>
  );
};
