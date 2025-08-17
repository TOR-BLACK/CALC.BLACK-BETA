import {CALCULATOR_CODE} from "./constants";

export interface CalculatorButtonType {
    text: string;
    code?: string | CALCULATOR_CODE;
    isBrown?: boolean;
    isBig?: boolean;
}