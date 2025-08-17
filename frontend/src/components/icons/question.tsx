import { COLOR } from "constants/colors";
import React from "react";
import { BasicIconProps } from "./types";

export const QuestionIcon: React.FC<BasicIconProps> = ({
  color = COLOR.WHITE,
  ...rest
}) => {
  return (
    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" {...rest}>
      <path
        d="M12 17V16.9929M12 14.8571C12 11.6429 15 12.3571 15 9.85714C15 8.27919 13.6568 7 12 7C10.6567 7 9.51961 7.84083 9.13733 9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
