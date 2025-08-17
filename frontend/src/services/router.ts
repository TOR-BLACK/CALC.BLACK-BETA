import { ROUTE } from "constants/router";

const routerService = {
  path: function (route: string | ROUTE): string {
    return `/${route}`;
  },
  note: function (id: string | number): string {
    return routerService.path(`${ROUTE.NOTEPAD}/${id}`);
  },
};

export default routerService;
