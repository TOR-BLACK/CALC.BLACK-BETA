import React, { ReactNode } from "react";
import cnService from "services/cn";
import "./index.scss";

interface PopupProps {
  isVisible?: boolean;
  children?: ReactNode;
}

function Popup(props: PopupProps) {
  const { isVisible = false, children = "" } = props;
  const cn = cnService.createCn("popup");

  return (
    <div className={cn("wrapper", { visible: isVisible })}>
      <div className={cn()}>{children}</div>
    </div>
  );
}

export default Popup;
