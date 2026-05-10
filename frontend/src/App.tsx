import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { SystemStatusBadge } from "./components/SystemStatusBadge";

function App() {
  return (
    <AuthProvider>
      <SystemStatusBadge />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
