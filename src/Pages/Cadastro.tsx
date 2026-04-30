import { useState } from "react";
import { postAuth } from "../Services/Api";
import { useNavigate } from "react-router-dom";

interface RequisitoDeSenha {
  id: string;
  descricao: string;
  validado: boolean;
}

export default function Cadastro() {
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [senhaRequisitos, setSenhaRequisitos] = useState<RequisitoDeSenha[]>([]);

  const navigate = useNavigate();

  // Validar requisitos da senha em tempo real
  const validarRequisitos = (senhaDigitada: string) => {
    const requisitos: RequisitoDeSenha[] = [
      {
        id: "minimo6",
        descricao: "Mínimo de 6 caracteres",
        validado: senhaDigitada.length >= 6,
      },
      {
        id: "maiuscula",
        descricao: "Pelo menos uma letra maiúscula",
        validado: /[A-Z]/.test(senhaDigitada),
      },
      {
        id: "minuscula",
        descricao: "Pelo menos uma letra minúscula",
        validado: /[a-z]/.test(senhaDigitada),
      },
      {
        id: "numero",
        descricao: "Pelo menos um número",
        validado: /[0-9]/.test(senhaDigitada),
      },
      {
        id: "especial",
        descricao: "Pelo menos um caractere especial (!@#$%^&*)",
        validado: /[!@#$%^&*]/.test(senhaDigitada),
      },
    ];

    setSenhaRequisitos(requisitos);
  };

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
    } catch (error: any) {
      // 🔥 Capturar senhaRequisitos do backend se disponível
      if (error?.response?.data?.senhaRequisitos) {
        const requisitosDoBackend = error.response.data.senhaRequisitos.map(
          (req: any) => ({
            id: req.id || req,
            descricao: req.descricao || req,
            validado: false,
          })
        );
        setSenhaRequisitos(requisitosDoBackend);
      }

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
                onChange={(e) => {
                  setSenha(e.target.value);
                  validarRequisitos(e.target.value);
                }}
                placeholder="Senha"
                className="h-12 w-full rounded-xl border px-4"
              />

              {senhaRequisitos.length > 0 && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Requisitos da senha:
                  </p>
                  {senhaRequisitos.map((req) => (
                    <div key={req.id} className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          req.validado ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {req.validado ? "✓" : "✗"}
                      </span>
                      <span
                        className={`text-sm ${
                          req.validado ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {req.descricao}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full rounded-xl text-slate-700 transition duration-200 hover:text-blue-600"
              >
                Já tenho conta, voltar ao login
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}