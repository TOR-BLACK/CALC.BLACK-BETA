export const CookieService = {
    setCookie: (name: string, value: string, expirationDate: string) => {
        var expires = "";
        if (expirationDate) {
            var date = new Date(expirationDate);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },
    getCookie: (name: string) => {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return '';
    },
    deleteCookie: (name: string) => {
        // Устанавливаем дату истечения срока действия в прошлое
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
}