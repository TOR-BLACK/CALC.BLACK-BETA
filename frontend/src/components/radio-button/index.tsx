import React, { ChangeEvent, MouseEvent } from "react";
import cnService from "services/cn";
import "./index.scss";

interface RadioButtonProps {
  value?: string;
  name?: string;
  formName?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (event: MouseEvent<HTMLInputElement>) => void;
}

function RadioButton(props: RadioButtonProps) {
  const {
    value,
    name,
    formName,
    label,
    checked = false,
    disabled = false,
    onChange = () => {},
    onClick = () => {},
  } = props;
  const cn = cnService.createCn("radio-button");
  const id: string = `${formName}-${name}-${value}`;
  const inputChangeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event);
  };

  return (
    <div style={{display: 'none'}} className={cn("block", { disabled })}>
      <input
        className={cn()}
        value={value}
        type="radio"
        id={id}
        name={name}
        onChange={inputChangeHandler}
        onClick={onClick}
        checked={checked}
        disabled={disabled}
      />
      <label htmlFor={id} className={cn("label")}>
        {label}
      </label>
    </div>
  );
}

export default RadioButton;
