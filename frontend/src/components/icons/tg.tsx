import { COLOR } from "constants/colors";
import React from "react";
import { BasicIconProps } from "./types";

export const TGIcon: React.FC<BasicIconProps> = ({
  color = COLOR.WHITE,
  ...rest
}) => {
  return (
    <svg
      width="25px"
      height="21px"
      fill='none'
      {...rest}
    >
    <path
      stroke={COLOR.WHITE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.41 9.275s10.172-4.171 13.7-5.64c1.353-.587 5.94-2.467 5.94-2.467s2.116-.823 1.94 1.175c-.06.822-.53 3.7-1 6.814-.706 4.406-1.47 9.223-1.47 9.223s-.118 1.351-1.117 1.586c-1 .235-2.646-.822-2.94-1.057-.235-.177-4.41-2.82-5.939-4.112-.412-.353-.882-1.058.059-1.88 2.117-1.939 4.645-4.347 6.174-5.875.705-.705 1.411-2.35-1.529-.352-4.175 2.878-8.29 5.58-8.29 5.58s-.942.588-2.706.06c-1.764-.53-3.822-1.234-3.822-1.234s-1.41-.882 1-1.821Z"
    />
    </svg>
  );
};
