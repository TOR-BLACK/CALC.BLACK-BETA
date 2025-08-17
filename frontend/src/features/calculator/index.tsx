import { NOTIFICATION_TYPE } from "constants/notifications";
import { ROUTE } from "constants/router";
import { calculatorHelper } from "features/calculator/helpers";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cnService from "services/cn";
import useStore from "store/hook";
import {
  CALCULATOR_CODE,
  CalculatorAllKeys,
  CalculatorButtons,
  CalculatorDigits,
  CalculatorWrongResults,
} from "./constants";
import "./index.scss";
import { CookieService } from "api/cookie";
import { SessionApiService } from "api/session";
import apiService from "services/api";

function Calculator() {
  const cn = cnService.createCn("calculator");
  const navigate = useNavigate();
  const { auth, addNotification } = useStore();

  const [expression, setExpression] = useState<string>("0");
  const pattern = /^\d{12}\+\d{4}$/;

  useEffect(() => {
    if (expression === "3+3+3") {
      navigate(ROUTE.NOTEPAD);
    }
    if (pattern.test(expression) && CookieService.getCookie('session-expiration')) {
      const partBeforePlus = expression.split('+')[0];
      const partAfterPlus = expression.split('+')[1];
      checkSession(partBeforePlus, partAfterPlus)
    }
  }, [expression]);

  interface SecondResponseData {
    id: string
    unique_identifier: string
    pin_code: string
    expiration_date: string
  }

  const checkSession = async (uniqId:string, pcod:string) => {
    if(pcod === CookieService.getCookie('session-p-cd')){
      try {
        const response = await SessionApiService.get(uniqId);
        CookieService.setCookie('session-active', 'true', CookieService.getCookie('session-expiration') as string);

        const secondResponseData = response.data as unknown as SecondResponseData;
        auth({
          id: secondResponseData.unique_identifier,
          login: secondResponseData.unique_identifier,
        });
        CookieService.setCookie('session-active', 'true', secondResponseData.expiration_date)
        CookieService.setCookie('session-id', secondResponseData.id, secondResponseData.expiration_date)
        CookieService.setCookie('session-u-id', secondResponseData.unique_identifier, secondResponseData.expiration_date)
        CookieService.setCookie('session-p-cd', secondResponseData.pin_code, secondResponseData.expiration_date)
        CookieService.setCookie('session-expiration', secondResponseData.expiration_date, secondResponseData.expiration_date)
        
        navigate(ROUTE.NOTEPAD);
        addNotification({
          text: 'Вход в сессию успешно осуществлен',
          type: NOTIFICATION_TYPE.SUCCESS,
        });
      } catch (e: any) {
        const errorText = apiService.getError(
          e,
          "Ошибка входа",
        );
        addNotification({
          text: errorText,
        });
        console.log(e.response)
      }
    }else{
      addNotification({
        text: 'Неверный пинкод',
      });
    }
  }

  const buttonClickHandler = (code: string | CALCULATOR_CODE, text: string) => {
    try {
      let newExpression: string = "";
      switch (code) {
        case CALCULATOR_CODE.AC:
          newExpression = calculatorHelper.clear();
          break;
        case CALCULATOR_CODE.PERCENT:
          newExpression = calculatorHelper.percent(expression);
          break;
        case CALCULATOR_CODE.INVERT:
          newExpression = calculatorHelper.invert(expression);
          break;
        case CALCULATOR_CODE.SEPARATOR:
          newExpression = calculatorHelper.separator(expression);
          break;
        case CALCULATOR_CODE.EQUALS:
          newExpression = calculatorHelper.equals(expression);
          break;
        default:
          if (CalculatorDigits.includes(text)) {
            newExpression = calculatorHelper.digit(expression, text);
          } else {
            newExpression = calculatorHelper.sign(expression, text);
          }
          break;
      }
      if (CalculatorWrongResults.includes(newExpression)) {
        addNotification({
          text: "Ошибка вычисления",
          type: NOTIFICATION_TYPE.WARNING,
        });
      } else {
        setExpression(newExpression);
      }
    } catch (e) {
      console.log(e);
      addNotification({
        text: "Введите корректное выражение",
        type: NOTIFICATION_TYPE.WARNING,
      });
    }
  };

  const handleKeydown = function (event: KeyboardEvent) {
    let key: string = event.key;
    let code: string = event.code;

    if (key === "Backspace") {
      const newExpression = expression.slice(0, -1);
      return setExpression(newExpression ? newExpression : "0");
    }
    if (["Enter", CALCULATOR_CODE.EQUALS].includes(key)) {
      key = CALCULATOR_CODE.EQUALS;
      code = key = CALCULATOR_CODE.EQUALS;
    }
    if ([",", CALCULATOR_CODE.SEPARATOR].includes(key)) {
      key = ",";
      code = CALCULATOR_CODE.SEPARATOR;
    }
    if (key === CALCULATOR_CODE.MULTIPLY) {
      key = "X";
      code = CALCULATOR_CODE.MULTIPLY;
    }
    if (CalculatorAllKeys.includes(key)) {
      buttonClickHandler(code, key);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [expression]);

  return (
    <div className={cn()}>
      <div className={cn("expression-wrapper")}>
        <div className={cn("expression")}>{expression}</div>
      </div>
      <div className={cn("buttons")}>
        {CalculatorButtons.map(({ text, code, isBrown, isBig }) => {
          return (
            <button
              key={text}
              className={cn("button", {
                brown: isBrown,
                big: isBig,
              })}
              type="button"
              onClick={() => buttonClickHandler(code as CALCULATOR_CODE, text)}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calculator;
