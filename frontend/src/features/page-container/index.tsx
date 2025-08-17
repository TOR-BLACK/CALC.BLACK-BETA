import { BackIcon } from "components/icons/back";
import { ROUTE } from "constants/router";
import { CSS_VARIABLE } from "constants/styles";
import Auth from "features/auth";
import React, { ReactNode, useEffect, useState } from "react";
import "./index.scss";
import { Link, useNavigate } from "react-router-dom";
import cnService from "services/cn";
import useStore from "store/hook";
import Session from "features/session";
import { CookieService } from "api/cookie";
import { SessionApiService } from "api/session";
import apiService from "services/api";
import { LoadingIcon } from "components/icons/loading";
import { NOTIFICATION_TYPE } from "constants/notifications";
import CountdownTimer from "features/cookie-expire-timer";
import { DeleteSessionPopup } from "features/delete-session-popup";
import { ReloadIcon } from "components/icons/reload";
import { DeleteIcon } from "components/icons/delete";
import { SaveIcon } from "components/icons/save";
import SessionExpirationDisplay from "features/cookie-expire-timer";
import { EscapeIcon } from "components/icons/escape";

interface PageContainerProps {
  /** Page content itself */
  children: ReactNode;

  /** Is page requires authorization */
  withAuth?: boolean;

  /** Is stretching page without paddings */
  isStretch?: boolean;

  /** Route for back button */
  backRoute?: string;

  calcPage?: boolean
}

function PageContainer(props: PageContainerProps) {
  const { children, withAuth, isStretch, backRoute, calcPage } = props;
  const cn = cnService.createCn("page-container");
  const cna = cnService.createCn("auth");
  const [sessionPinCode, setSessionPinCode] = useState(CookieService.getCookie('session-p-cd'));
  const [deleteSessionPopupVis, setDeleteSessionPopupVis] = useState(false);
  const [isAuthShowed, showAuth] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthPathShowed, showAuthPath] = useState(true);
  const { auth, isAuthorized, logout, addNotification } = useStore();
  const navigate = useNavigate();

  const sessionUid = CookieService.getCookie('session-u-id')

  const getApplicationParams = () => {
    const onePercentHeight: number = window.innerHeight * 0.01;
    const main: HTMLElement = document.querySelector(
      ".page-container",
    ) as HTMLElement;

    if (main) {
      document.documentElement.style.setProperty(
        CSS_VARIABLE.VERTICAL_HEIGHT,
        `${onePercentHeight}px`,
      );
    }
  };

  const changePinCode = async () => {
    setIsLoading(true);
      try {
        let randomNumber = ''+Math.floor(Math.random() * 10000)
        const response = await SessionApiService.patch(sessionUid as string, randomNumber);
        console.log(response)
        CookieService.setCookie('session-p-cd', randomNumber, CookieService.getCookie('session-expired'))
        setSessionPinCode(randomNumber);
        addNotification({
          text: 'PinCode changed',
          type: NOTIFICATION_TYPE.SUCCESS,
        });
        setIsLoading(false);
      } catch (e: any) {
        const errorText = apiService.getError(
          e,
          "Не удалось изменить PinCode",
        );
        setError(errorText);
        addNotification({
          text: errorText,
        });
        setIsLoading(false);
        console.log(e.response)
      }
    }

  const sessionInfo = <div className={cn("session-options")}>
      <div>Сессия: {sessionUid}</div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        {isLoading ? <LoadingIcon /> : <div>Пин: {sessionPinCode}</div>}
        <div title="Обновить пинкод" onClick={changePinCode} style={{marginLeft: '20px', display: 'flex', cursor: 'pointer'}}><ReloadIcon/></div>
      </div>
      <SessionExpirationDisplay/>
    </div>

  const handleResize = () => {
    getApplicationParams();

    /** Fix incorrect height after changing device orientation */
    setTimeout(() => getApplicationParams(), 0);
  };

  useEffect(() => {
    getApplicationParams();
    window.addEventListener("resize", handleResize);
    
    if(CookieService.getCookie('session-id') && CookieService.getCookie('session-active')==='true' && !isAuthorized){
      console.log(CookieService.getCookie('session-id'))
      auth({
        id: CookieService.getCookie('session-u-id') as string,
        login: CookieService.getCookie('session-u-id') as string,
      })
    }
    if(CookieService.getCookie('session-active')==='false' && !isAuthorized){
      logout()
    }
  }, []);

  return (
    <div style={{height: '100vh', backgroundColor: calcPage? '#333' : 'transparent'}} className={cn("", { stretch: isStretch })}>
      <div className={cn("header")}>
        {backRoute && CookieService.getCookie('session-active') !== 'true' && (
          <Link to={backRoute}>
            <BackIcon />
          </Link>
        )}
        {withAuth && isAuthorized && CookieService.getCookie('session-active') === 'true' && sessionInfo}
        {withAuth && isAuthorized && CookieService.getCookie('session-active') === 'true' && <div className={cn("session-options")}>Управление сессией:
            <div style={{'display': "flex"}}>
              <div title="Копировать данные сессии" onClick={()=>{navigator.clipboard.writeText('Сессия: '+sessionUid+'\nПин:'+sessionPinCode as string)}} style={{cursor: 'pointer'}}><SaveIcon/></div>
              <div title="Выйти из сессии" onClick={()=>{logout(); CookieService.setCookie('session-active', 'false', CookieService.getCookie('session-expiration')); navigate(ROUTE.ROOT)}} style={{marginLeft: '20px', cursor: 'pointer'}}><EscapeIcon/></div>
              <div title="Уделить сессию" onClick={()=>setDeleteSessionPopupVis(true)} style={{marginLeft: '20px', cursor: 'pointer'}}><DeleteIcon/></div>
            </div>
          </div>}
        {deleteSessionPopupVis && <DeleteSessionPopup hide={setDeleteSessionPopupVis}/>}
        
        {withAuth && isAuthorized && CookieService.getCookie('session-active') !== 'true' && (
          <button
            className={cn("logout")}
            onClick={() => {
              logout();
              CookieService.setCookie('session-active', 'false', CookieService.getCookie('session-expiration'));
              CookieService.deleteCookie('session-id')
              CookieService.deleteCookie('session-u-id')
              CookieService.deleteCookie('session-expiration')
                       navigate(ROUTE.ROOT);
            }}
          >
            Выйти
          </button>
        )}
      </div>

            {error && <div className={cn("error")}>{error}</div>}
            {!isAuthShowed ? !withAuth || isAuthorized ? "" : <div style={{alignSelf: 'center', backgroundColor: '#1b1b1b', borderRadius: '20px', display: 'flex', flexDirection: 'column', maxWidth: '350px', padding: '10px', width: '100%',}}>
              <Session showAuthPath={showAuthPath} setPin={setSessionPinCode}/>
              {isAuthPathShowed?<button className={cna("submit")} onClick={()=>(showAuth(true))}>Авторизоваться</button>:''}
            </div> : ""
            }
            {!withAuth || isAuthorized ? children : isAuthShowed ? <Auth /> : ''}
    </div>
  );
}

export default PageContainer;
