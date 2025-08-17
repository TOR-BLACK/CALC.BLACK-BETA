import Notifications from "features/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import "styles/global/index.scss";
import { RouterProvider } from "react-router-dom";
import { router } from "router";
import { StoreProvider } from "store/provider";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <StoreProvider>
    <RouterProvider router={router} />
    <Notifications />
  </StoreProvider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
