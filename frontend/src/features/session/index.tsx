import { SessionApiService } from "api/session";
import { NOTIFICATION_TYPE } from "constants/notifications";
import { useState } from "react";
import apiService from "services/api";
import cnService from "services/cn";
import useStore from "store/hook";
import { LoadingIcon } from "components/icons/loading";
import { CookieService } from "api/cookie";

interface SecondResponseData {
  id: string
  unique_identifier: string
  pin_code: string
  expiration_date: string
}

function Session({ showAuthPath, setPin}: { showAuthPath: (value: boolean) => void , setPin: (value: string) => void}) {
  const cn = cnService.createCn("auth");
  const { auth, addNotification } = useStore();

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submit = async () => {
    setIsLoading(true);
    showAuthPath(false)
      try {
        const response = await SessionApiService.create();

        console.log("Response from server:", response.data);

        addNotification({
          text: "Временная сессия успешно создана",
          type: NOTIFICATION_TYPE.SUCCESS,
        });
        setIsLoading(false);

        const secondResponse = await SessionApiService.get(response.data.unique_identifier);
        const secondResponseData = secondResponse.data as unknown as SecondResponseData;

        console.log("Response from server:", secondResponse);
        showAuthPath(true)
        auth({
          id: secondResponseData.unique_identifier,
          login: secondResponseData.unique_identifier,
        });
        CookieService.setCookie('session-active', 'true', secondResponseData.expiration_date)
        CookieService.setCookie('session-id', secondResponseData.id, secondResponseData.expiration_date)
        CookieService.setCookie('session-u-id', secondResponseData.unique_identifier, secondResponseData.expiration_date)
        CookieService.setCookie('session-p-cd', secondResponseData.pin_code, secondResponseData.expiration_date)
        CookieService.setCookie('session-expiration', secondResponseData.expiration_date, secondResponseData.expiration_date)
        setPin(secondResponseData.pin_code)
      } catch (e: any) {
        const errorText = apiService.getError(
          e,
          "Не удалось создать временную сессию",
        );
        setError(errorText);
        addNotification({
          text: errorText,
        });
        setIsLoading(false);
        console.log(e.response)
      }
    }

  return (
    <>
      {error && <div className={cn("error")}>{error}</div>}
      {isLoading ? <LoadingIcon /> : <button className={cn("submit")} disabled={isLoading} onClick={submit}>Создать временную сессию</button>}
    </>
  );
}

export default Session;
