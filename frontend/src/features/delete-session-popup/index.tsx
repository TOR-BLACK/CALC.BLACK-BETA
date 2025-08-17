import { CookieService } from 'api/cookie';
import { SessionApiService } from 'api/session';
import { LoadingIcon } from 'components/icons/loading';
import { NOTIFICATION_TYPE } from 'constants/notifications';
import { ROUTE } from 'constants/router';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import apiService from 'services/api';
import cnService from 'services/cn';
import useStore from 'store/hook';

export const DeleteSessionPopup = ({hide}: { hide: (value: boolean) => void }) => {
    const cn = cnService.createCn("auth");
    const { logout, addNotification } = useStore();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
  
    const submit = async () => {
      setIsLoading(true);
        try {
          const response = await SessionApiService.delete(CookieService.getCookie('session-u-id'));
  
          console.log("Response from server:", response.data);
  
          addNotification({
            text: "Временная сессия успешно удалена",
            type: NOTIFICATION_TYPE.SUCCESS,
          });
          setIsLoading(false);
  
          logout();
          CookieService.deleteCookie('session-active')
          CookieService.deleteCookie('session-id')
          CookieService.deleteCookie('session-u-id')
          CookieService.deleteCookie('session-p-cd')
          CookieService.deleteCookie('session-expiration')
          hide(false)
          navigate(ROUTE.ROOT);
        } catch (e: any) {
          const errorText = apiService.getError(
            e,
            "Не удалось удалить временную сессию",
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
        <div onClick={()=>hide(false)} style={{'position': 'fixed', width: '100vw', height: '100vh', backgroundColor: '#00000050', 'top': '0', 'left': '0'}}>
        </div>
            <div style={{'position': 'fixed', 'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)', backgroundColor: '#161616', width: '300px', padding: '20px', borderRadius: '20px', zIndex: 1000}}>
                {isLoading ? <LoadingIcon /> : 
                <><div className={cn("title")}>Вы уверены?</div>
                
                    <div style={{display: 'flex', padding: '10px', justifyContent: 'space-between'}}>
                        <button style={{background: '#0E9594', border: '1px solid #2d2d2d', padding: '10px 30px', width: '100px', fontSize: '20px', borderRadius: '20px'}} onClick={()=>submit()}>Да</button>
                        <button style={{background: '#161616', border: '1px solid #2d2d2d', padding: '10px 30px', width: '100px', fontSize: '20px', borderRadius: '20px'}} onClick={()=>hide(false)}>Нет</button>
                    </div>
                </>}
                
            </div>
    </>
)}