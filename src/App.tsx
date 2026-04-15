import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Cadastro from "./Pages/Cadastro";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}