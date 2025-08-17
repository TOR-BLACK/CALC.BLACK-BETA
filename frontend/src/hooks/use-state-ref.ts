import { RefObject, useEffect, useRef, useState } from "react";

export function useStateRef<ValueType>(
  initialValue: ValueType,
): [
  value: ValueType,
  setValue: (value: ValueType | ((oldValue: ValueType) => ValueType)) => void,
  getValue: () => ValueType,
  ref: RefObject<ValueType>,
] {
  const [value, setValue] = useState<ValueType>(initialValue);

  const ref = useRef<ValueType>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  const getActiveSlide = () => ref.current;

  return [value, setValue, getActiveSlide, ref];
}
