import { useState } from "react";
import { postAuth } from "../Services/Api";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha !== confirmacaoSenha) {
      setErro("A confirmacao de senha precisa ser igual a senha.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const valor = identificador.trim();
    if (!valor) {
      setErro("Informe login ou email.");
      return;
    }

    setIsLoading(true);

    const isEmail = valor.includes("@");
    const nomeBase = isEmail ? valor.split("@")[0] || valor : valor;

    try {
      await postAuth("/cadastro", {
        nome: nomeBase,
        senha,
        ...(isEmail ? { email: valor } : { login: valor }),
      });

      navigate("/login");
    } catch {
      setErro("Erro ao cadastrar. Verifique os dados e tente novamente.");
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
              Crie sua conta e inicie suas negociacoes.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Cadastro rapido, direto ao ponto e pronto para uso em desktop e
              mobile.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
              Use login ou email para cadastrar seu acesso.
            </p>
            <p className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
              Confirmacao de senha para reduzir erros de digitacao.
            </p>
          </div>
        </aside>

        <section className="flex items-center p-6 sm:p-8 md:p-10">
          <div className="w-full animate-[fadeIn_.45s_ease-out]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Cadastro
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Criar conta
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Preencha os dados para criar seu acesso.
            </p>

            <form onSubmit={handleCadastro} className="mt-7 space-y-4">
              <div>
                <label
                  htmlFor="identificador"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Login ou email
                </label>
                <input
                  id="identificador"
                  type="text"
                  required
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="seu_login ou voce@exemplo.com"
                />
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
                  placeholder="Minimo de 6 caracteres"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmacaoSenha"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirmacao de senha
                </label>
                <input
                  id="confirmacaoSenha"
                  type="password"
                  required
                  value={confirmacaoSenha}
                  onChange={(e) => setConfirmacaoSenha(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Repita sua senha"
                />
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
                {isLoading ? "Cadastrando..." : "Criar conta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Ja possui conta?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-cyan-700 transition hover:text-cyan-600"
              >
                Entrar
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}