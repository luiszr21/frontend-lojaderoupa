import { useState } from "react";
import { postAuth } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");

    // validação senha
    if (senha !== confirmacaoSenha) {
      setErro("A confirmação de senha precisa ser igual à senha.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const valor = identificador.trim();

    if (!valor) {
      setErro("Informe um email.");
      return;
    }

    // 🚨 FORÇANDO uso de email (evita erro com backend)
    if (!valor.includes("@")) {
      setErro("Informe um email válido.");
      return;
    }

    const nomeBase = valor.split("@")[0];

    setIsLoading(true);

    try {
      await postAuth("/cadastro", {
        nome: nomeBase,
        email: valor,
        senha,
      });

      navigate("/login");
    } catch (error) {
      // 🔥 tratamento real do erro
      const mensagem =
        error?.response?.data?.erro ||
        error?.response?.data?.message ||
        "Erro ao cadastrar. Tente novamente.";

      setErro(mensagem);
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
              Crie sua conta e inicie suas negociações.
            </h1>
          </div>
        </aside>

        <section className="flex items-center p-6 sm:p-8 md:p-10">
          <div className="w-full">
            <h2 className="text-3xl font-black text-slate-900">
              Criar conta
            </h2>

            <form onSubmit={handleCadastro} className="mt-7 space-y-4">
              <input
                type="text"
                required
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="email@exemplo.com"
                className="h-12 w-full rounded-xl border px-4"
              />

              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                className="h-12 w-full rounded-xl border px-4"
              />

              <input
                type="password"
                required
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                placeholder="Confirmar senha"
                className="h-12 w-full rounded-xl border px-4"
              />

              {erro && (
                <p className="text-red-500 text-sm">{erro}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full bg-black text-white rounded-xl"
              >
                {isLoading ? "Cadastrando..." : "Criar conta"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}