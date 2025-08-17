import { CookieService } from 'api/cookie';
import React, { useEffect, useState } from 'react';

const SessionExpirationDisplay = () => {
    const [expirationDate, setExpirationDate] = useState<Date | null>(null);

    useEffect(() => {
        const expirationDateString = CookieService.getCookie('session-expiration');
        if (expirationDateString) {
            const date = new Date(expirationDateString);
            setExpirationDate(date);
        }
    }, []);

    const extendSession = () => {
        if (expirationDate) {
            const newExpiration = new Date(expirationDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
            const now = new Date();
            const maxExpiration = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

            if (newExpiration <= maxExpiration) {
                // Обновляем все куки с новым сроком действия
                let newExpirationDate = newExpiration.toISOString()
                CookieService.setCookie('session-expiration', newExpirationDate, newExpirationDate);
                CookieService.setCookie('session-active', 'true', newExpirationDate);
                CookieService.setCookie('session-id', CookieService.getCookie('session-id') as string, newExpirationDate);
                CookieService.setCookie('session-u-id', CookieService.getCookie('session-u-id') as string, newExpirationDate);
                CookieService.setCookie('session-p-cd', CookieService.getCookie('session-p-cd') as string, newExpirationDate);

                setExpirationDate(newExpiration);
            }
        }
    };

    let expirationDisplay = 'Session has expired';
    if (expirationDate) {
        const day = String(expirationDate.getDate()).padStart(2, '0');
        const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
        const hour = String(expirationDate.getHours()).padStart(2, '0');
        const minute = String(expirationDate.getMinutes()).padStart(2, '0');

        expirationDisplay = `${day}.${month} ${hour}:${minute}`;
    }

    return (
        <div>
            <p>
                <span style={{ fontWeight: 700 }}>
                    {expirationDisplay}
                </span>
                <span title="Продлить сессию" style={{ fontSize: '26px', cursor: 'pointer', marginLeft: '20px' }} onClick={extendSession}>+</span>
            </p>
        </div>
    );
};

export default SessionExpirationDisplay;