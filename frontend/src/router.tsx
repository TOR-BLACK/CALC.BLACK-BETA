import { ROUTE } from "constants/router";
import CalculatorPage from "pages/calculator";
import NotePage from "pages/note";
import NotepadPage from "pages/notepad";
import * as React from "react";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: ROUTE.ROOT,
    element: <CalculatorPage />,
  },
  {
    path: ROUTE.NOTEPAD,
    element: <NotepadPage />,
  },
  {
    path: ROUTE.NEW_NOTE,
    element: <NotePage />,
  },
  {
    path: ROUTE.NOTE,
    element: <NotePage />,
  },
]);
