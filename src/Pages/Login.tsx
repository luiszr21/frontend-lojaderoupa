import { useState } from "react";
import axios from "axios";
import { postAuth } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

type Role = "user" | "admin";

interface LoginApiResponse {
  token: string;
  user?: {
    id: string;
    role: Role;
    nome?: string;
    email?: string;
  };
}

interface ApiErrorResponse {
  erro?: string;
  campos?: Record<string, string>;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoAcesso, setTipoAcesso] = useState<Role>("user");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});

  const loginStore = useAuthStore();
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setErrosCampo({});
    setIsLoading(true);

    try {
      const endpoint = tipoAcesso === "admin" ? "/admin/login" : "/login";
      const res = await postAuth<LoginApiResponse>(endpoint, { email, senha });
      const data = res.data;

      const role = data.user?.role;
      const userId = data.user?.id;

      if (!data.token || !userId) {
        throw new Error("Resposta de login incompleta.");
      }

      if (!role) {
        throw new Error("Resposta de login sem role.");
      }

      loginStore.login({
        token: data.token,
        role,
        userId,
      });

      navigate(role === "admin" ? "/admin" : "/cliente");
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const mensagem = error.response?.data?.erro;
        const campos = error.response?.data?.campos;

        if (campos) {
          setErrosCampo(campos);
        }

        setErro(mensagem ?? "Email ou senha invalidos.");
      } else {
        setErro("Nao foi possivel fazer login.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)] px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />

      <div className="relative mx-auto grid min-h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur md:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-slate-900 p-10 text-slate-100 md:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
              Front Roupas
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight">
              Entre e acompanhe propostas em tempo real.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Um painel limpo para voce negociar produtos, visualizar interacoes
              e manter seu fluxo de vendas organizado.
            </p>
          </div>
        </aside>

        <section className="flex items-center p-6 sm:p-8 md:p-10">
          <div className="w-full animate-[fadeIn_.45s_ease-out]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Acesso
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Faça login para continuar no painel.
            </p>

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div>
                <p className="mb-2 block text-sm font-medium text-slate-700">Tipo de acesso</p>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="tipoAcesso"
                      value="user"
                      checked={tipoAcesso === "user"}
                      onChange={() => setTipoAcesso("user")}
                    />
                    Cliente
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="tipoAcesso"
                      value="admin"
                      checked={tipoAcesso === "admin"}
                      onChange={() => setTipoAcesso("admin")}
                    />
                    Admin
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="voce@exemplo.com"
                />
                {errosCampo.email ? (
                  <p className="mt-1 text-sm text-rose-700">{errosCampo.email}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="senha" className="mb-2 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Sua senha"
                />
                {errosCampo.senha ? (
                  <p className="mt-1 text-sm text-rose-700">{errosCampo.senha}</p>
                ) : null}
              </div>

              {erro ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {erro}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Ainda nao tem conta?{" "}
              <button
                type="button"
                onClick={() => navigate("/cadastro")}
                className="font-semibold text-cyan-700 transition hover:text-cyan-600"
              >
                Criar conta
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}