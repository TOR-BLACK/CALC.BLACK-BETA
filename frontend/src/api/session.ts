import { Api } from "api/index";

export const SessionApiService = {
  create: () => Api.post("session"),
  get: (uniqueId: string) => Api.get<string>(`session/${uniqueId}`),

  patch: (uniqueId: string, pinCode: string) => {
    const formData = new FormData();
    formData.append("unique_identifier", uniqueId);
    formData.append("new_pin_code", pinCode);

    return Api.patch<string>("session", formData);
  },

  delete: (uniqueId: string) => {
    const formData = new FormData();
    formData.append("unique_identifier", uniqueId);
    
    return Api.delete<string>(`session`, { data: formData });
  },

}