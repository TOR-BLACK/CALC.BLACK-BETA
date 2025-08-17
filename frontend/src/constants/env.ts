export const ENV_CALCULATOR_URL: string =
  `${window.location.origin.includes('test') ? 'https://localhost' : 'https://localhost'}`;
export const ENV_FILEHOSTING_URL: string =
  `${window.location.origin.includes('test') ? 'https://localhost' : 'https://localhost'}`;
export const ENV_CLOUDFLARE_CAPTCHA_KEY: string ="0x4AAAAAAAiekwJ_yQ6BTgqc";
  // REACT_APP_FILEHOSTING_URL https://localhost

export const ENV_FILEHOSTING_DOMAIN = ENV_FILEHOSTING_URL.replace(
  "https://",
  "",
);
