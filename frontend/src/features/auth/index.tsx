import { AuthApiService } from "api/auth";
import { LoadingIcon } from "components/icons/loading";
import { ENV_CLOUDFLARE_CAPTCHA_KEY } from "constants/env";
import { NOTIFICATION_TYPE } from "constants/notifications";
import React, { useEffect, useState } from "react";
import Turnstile from "react-turnstile";
import apiService from "services/api";
import cnService from "services/cn";
import useStore from "store/hook";
import "./index.scss";
import SVG_PassEye from "components/icons/SVG_PassEye";

function Auth() {
  const cn = cnService.createCn("auth");
  const { auth, addNotification } = useStore();

  const [isRegistration, setIsRegistration] = useState<boolean>(false);
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidCaptcha, setIsValidCaptcha] = useState<boolean>(false);

  const submit = async () => {
    const preparedLogin = login.trim();
    const preparedPassword = password.trim();
    if (!isValidCaptcha) return setError("Заполните капчу");
    if (!preparedLogin) return setError("Введите логин");
    if (!preparedPassword) return setError("Введите пароль");
    setIsLoading(true);

    if (isRegistration) {
      try {
        await AuthApiService.register(preparedLogin, preparedPassword);

        switchForm();
        addNotification({
          text: "Аккаунт успешно зарегистрирован",
          type: NOTIFICATION_TYPE.SUCCESS,
        });
        setIsLoading(false);
      } catch (e: any) {
        const errorText = apiService.getError(
          e,
          "Не удалось зарегистрироваться",
        );
        setError(errorText);
        addNotification({
          text: errorText,
        });
        setIsLoading(false);
      }
    } else {
      try {
        const response = await AuthApiService.login(
          preparedLogin,
          preparedPassword,
        );

        setError("");
        addNotification({
          text: "Вход успешно выполнен",
          type: NOTIFICATION_TYPE.SUCCESS,
        });
        setIsLoading(false);
        auth({
          id: response.data,
          login: preparedLogin,
        });
      } catch (e: any) {
        const errorText = apiService.getError(e, "Не удалось войти");
        setError(errorText);
        addNotification({
          text: errorText,
        });
        setIsLoading(false);
      }
    }
  };

  const switchForm = () => {
    setIsRegistration(!isRegistration);
    setLogin("");
    setPassword("");
    setError("");
  };

  useEffect(() => {}, []);

  return (
    <div className={cn()}>
      <div className={cn("title")}>
        {isRegistration ? `Регистрация` : "Авторизация"}
      </div>
      <div className={cn("fields")}>
        <input
          className={cn("input")}
          value={login}
          disabled={isLoading}
          placeholder="Логин"
          onChange={(event) => setLogin(event.target.value.trim().replaceAll(' ', ''))}
        />
        <div className={cn("pass_wrap")}>
          <input
            className={cn("input")}
            value={password}
            disabled={isLoading}
            placeholder="Пароль"
            type={passwordHidden?'password':'text'}
            onChange={(event) => setPassword(event.target.value.trim().replaceAll(' ', ''))}
          />
          <div className={cn("pass_wrap_eye")} onClick={()=>{setPasswordHidden(!passwordHidden)}}>
            <SVG_PassEye eyeOpened={passwordHidden}/>
          </div>
        </div>
        <Turnstile
          className={cn("captcha")}
          sitekey={ENV_CLOUDFLARE_CAPTCHA_KEY}
          onVerify={() => {
            setIsValidCaptcha(true);
            setError("");
          }}
          onExpire={() => {
            setIsValidCaptcha(false);
          }}
          onError={() => {
            setIsValidCaptcha(false);
          }}
          refreshExpired="auto"
          theme="dark"
        />
      </div>
      {error && <div className={cn("error")}>{error}</div>}

      <button
        className={cn("submit")}
        type="button"
        disabled={isLoading}
        onClick={() => {
          submit();
        }}
      >
        {isLoading ? (
          <LoadingIcon />
        ) : isRegistration ? (
          "Создать аккаунт"
        ) : (
          "Войти"
        )}
      </button>
      <div className={cn("footer")}>
        <div className={cn("switch-label")}>
          {isRegistration ? "Есть аккаунт?" : "Нет аккаунта?"}
        </div>
        <button
          type="button"
          className={cn("switch-form")}
          disabled={isLoading}
          onClick={switchForm}
        >
          {isRegistration ? "Войти" : "Создать"}
        </button>
      </div>
    </div>
  );
}

export default Auth;
