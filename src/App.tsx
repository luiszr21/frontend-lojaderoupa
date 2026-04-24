import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Pages/home";
import Login from "./Pages/Login";
import Cadastro from "./Pages/Cadastro";
import MinhasInteracoes from "./Pages/MinhasInteracoes";
import AdminPropostas from "./Pages/AdminPropostas";
import MinhaConta from "./Pages/MinhaConta";
import { useAuthStore } from "./stores/authStore";

type Role = "user" | "admin";

function PrivateRoute({
  children,
  allow,
}: {
  children: JSX.Element;
  allow: Role[];
}) {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (!token) {
    return children;
  }

  return <Navigate to={role === "admin" ? "/admin" : "/cliente"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/cadastro"
          element={
            <PublicOnlyRoute>
              <Cadastro />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/cliente"
          element={
            <PrivateRoute allow={["user"]}>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/cliente/minhas-propostas"
          element={
            <PrivateRoute allow={["user"]}>
              <MinhasInteracoes />
            </PrivateRoute>
          }
        />
        <Route
          path="/conta"
          element={
            <PrivateRoute allow={["user", "admin"]}>
              <MinhaConta />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute allow={["admin"]}>
              <AdminPropostas />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}