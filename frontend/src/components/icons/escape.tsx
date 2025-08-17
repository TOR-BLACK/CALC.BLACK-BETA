import { COLOR } from "constants/colors";
import React from "react";
import { BasicIconProps } from "./types";

export const EscapeIcon: React.FC<BasicIconProps> = ({
  color = COLOR.WHITE,
  ...rest
}) => {
  return (
    <svg
      width={21}
      height={21}
      fill='none'
      {...rest}
    >
    <path
      stroke={COLOR.WHITE}
      strokeLinecap="round"
      strokeMiterlimit={16}
      strokeWidth={2}
      d="m1 1 19 19M20 1 1 20"
    />
    </svg>
  );
};
