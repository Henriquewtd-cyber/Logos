
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Incidentes from "./pages/Incidentes";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "incidentes",
        element: <Incidentes />,
      },
      {
        path: "login",
        element: <Login onSubmit={() => {}} />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
