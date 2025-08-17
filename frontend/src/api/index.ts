import axios from "axios";
import { ENV_CALCULATOR_URL, ENV_FILEHOSTING_URL } from "constants/env";

// 'https://localhost/api/register?login=1&password=2'
export const Api = axios.create({
  baseURL: `${ENV_CALCULATOR_URL}/api`,
});

export const DvdApi = axios.create({
  baseURL: `${ENV_FILEHOSTING_URL}/api`,
});
