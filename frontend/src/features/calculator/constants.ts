import { CalculatorButtonType } from "./types";

export const CALCULATOR_NUMBER_REGEX = /([0-9]+(,[0-9]+)?)/g;
export const CALCULATOR_BRACKET_NUMBER_REGEX = /\((-[0-9]+(,[0-9]+)?)\)/g;

export enum CALCULATOR_CODE {
  AC = "ACC",
  INVERT = "+/--",
  PERCENT = "%%",
  DIVIDE = "/",
  MULTIPLY = "*",
  MINUS = "-",
  PLUS = "+",
  SEPARATOR = ".",
  EQUALS = "=",
}

export const CalculatorWrongResults = ["NaN", "Infinity", "-Infinity"];

export const CalculatorSigns = [
  CALCULATOR_CODE.DIVIDE,
  CALCULATOR_CODE.MINUS,
  CALCULATOR_CODE.PLUS,
  "X",
];

export const CalculatorDigits = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

export const CalculatorButtons: CalculatorButtonType[] = [
  {
    text: "АС",
    code: CALCULATOR_CODE.AC,
  },
  {
    text: "+/-",
    code: CALCULATOR_CODE.INVERT,
  },
  {
    text: "%",
    code: CALCULATOR_CODE.PERCENT,
  },
  {
    text: "/",
    code: CALCULATOR_CODE.DIVIDE,
    isBrown: true,
  },
  {
    text: "7",
  },
  {
    text: "8",
  },
  {
    text: "9",
  },
  {
    text: "X",
    code: CALCULATOR_CODE.MULTIPLY,
    isBrown: true,
  },
  {
    text: "4",
  },
  {
    text: "5",
  },
  {
    text: "6",
  },
  {
    text: "-",
    code: CALCULATOR_CODE.MINUS,
    isBrown: true,
  },
  {
    text: "1",
  },
  {
    text: "2",
  },
  {
    text: "3",
  },
  {
    text: "+",
    code: CALCULATOR_CODE.PLUS,
    isBrown: true,
  },
  {
    text: "0",
    isBig: true,
  },
  {
    text: ",",
    code: CALCULATOR_CODE.SEPARATOR,
  },
  {
    text: "=",
    code: CALCULATOR_CODE.EQUALS,
    isBrown: true,
  },
];

export const CalculatorAllKeys = CalculatorButtons.map((item) => item.text);
