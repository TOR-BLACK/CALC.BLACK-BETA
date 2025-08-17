import { numberService } from "services/number";
import { stringService } from "services/string";
import {
  CALCULATOR_BRACKET_NUMBER_REGEX,
  CALCULATOR_CODE,
  CALCULATOR_NUMBER_REGEX,
  CalculatorDigits,
  CalculatorSigns,
} from "./constants";

export const calculatorHelper = {
  equals: function (expression: string): string {
    let newExpression: string | number = expression;

    newExpression = newExpression
      .replaceAll("X", CALCULATOR_CODE.MULTIPLY)
      .replaceAll(",", CALCULATOR_CODE.SEPARATOR);
    newExpression = eval(newExpression) as number;
    newExpression = numberService.maxFloating(newExpression);
    newExpression = numberService.maxExponential(newExpression);
    newExpression = `${newExpression}`.replaceAll(
      CALCULATOR_CODE.SEPARATOR,
      ",",
    );

    return newExpression;
  },
  clear: function (): string {
    return "0";
  },
  invert: function (expression: string): string {
    const allPositiveOperands: string[] =
      expression.match(CALCULATOR_NUMBER_REGEX) || [];
    const allNegativeOperands: string[] =
      expression.match(CALCULATOR_BRACKET_NUMBER_REGEX) || [];

    const lastPositiveOperand = allPositiveOperands.at(-1);
    const lastNegativeOperand = allNegativeOperands.at(-1);

    const positiveOperandIndex = lastPositiveOperand
      ? expression.lastIndexOf(lastPositiveOperand) + lastPositiveOperand.length
      : 0;
    const negativeOperandIndex = lastNegativeOperand
      ? expression.lastIndexOf(lastNegativeOperand) + lastNegativeOperand.length
      : 0;
    const lastOperand: string =
      (positiveOperandIndex > negativeOperandIndex
        ? lastPositiveOperand
        : lastNegativeOperand) || "";

    if (lastOperand) {
      const newOperand =
        lastOperand[1] === CALCULATOR_CODE.MINUS
          ? lastOperand.replaceAll(/[(\-)]/g, "")
          : `(-${lastOperand})`;

      const newExpression = stringService.replaceLast(
        expression,
        lastOperand,
        newOperand,
      );

      return newExpression;
    }

    return expression;
  },
  percent: function (expression: string): string {
    const result = Number(
      calculatorHelper
        .equals(expression)
        .replaceAll(",", CALCULATOR_CODE.SEPARATOR),
    );
    let newExpression: number | string = result / 100;
    newExpression = numberService.maxFloating(newExpression);
    newExpression = `${newExpression}`.replaceAll(
      CALCULATOR_CODE.SEPARATOR,
      ",",
    );

    return newExpression;
  },
  digit: function (expression: string, digit: string): string {
    return expression === "0" ? digit : expression + digit;
  },
  sign: function (expression: string, sign: string): string {
    const lastSign = expression.at(-1) as string;
    if (CalculatorSigns.includes(lastSign)) {
      return `${expression.slice(0, -1)}${sign}`;
    }
    return expression + sign;
  },
  separator: function (expression: string): string {
    const lastSign = expression.at(-1) as string;
    if (CalculatorDigits.includes(lastSign)) return expression + ",";

    return expression;
  },
};
