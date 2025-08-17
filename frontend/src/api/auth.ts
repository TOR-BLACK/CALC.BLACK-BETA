import { Api } from "api/index";

export const AuthApiService = {
  register: (login: string, password: string) => {
    const formData = new FormData();
    formData.append("login", login);
    formData.append("password", password);

    return Api.post("register", formData);
  },
  /** @return user id in data */
  login: (login: string, password: string) => {
    const formData = new FormData();
    formData.append("login", login);
    formData.append("password", password);

    return Api.post<string>("auth", formData);
  },
};
