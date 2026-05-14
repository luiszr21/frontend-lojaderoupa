import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";
import type { Produto as ProdutoType } from "../types/produto";
// import types trimmed - payload sent directly
import axios from "axios";

export default function Produto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [produto, setProduto] = useState<ProdutoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isEnviandoProposta, setIsEnviandoProposta] = useState(false);
  const [propostaPendente] = useState(false);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // Buscar detalhes do produto
  useEffect(() => {
    if (!id) return;

    api
      .get<ProdutoType>(`/produtos/${id}`)
      .then((res) => {
        setProduto(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setErro("Produto não encontrado.");
        } else {
          setErro("Erro ao carregar o produto.");
        }
        setIsLoading(false);
      });
  }, [id]);

  async function handleEnviarProposta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!mensagem.trim()) {
      setErro("A mensagem não pode estar vazia.");
      return;
    }

    if (!produto) {
      setErro("Produto não carregado.");
      return;
    }

    setIsEnviandoProposta(true);

    try {
      const payload = {
        produtoId: produto.id,
        mensagem: mensagem.trim(),
      };

      // Enviar proposta para o backend (token via interceptor)
      await api.post("/propostas", payload);

      // Notificar outras telas e redirecionar para minhas propostas
      window.dispatchEvent(new CustomEvent("propostas:updated"));
      navigate("/propostas", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        if (statusCode === 400) {
          setErro("Dados inválidos. Tente novamente.");
        } else if (statusCode === 401) {
          setErro("Sessão expirada. Faça login novamente.");
          navigate("/login", { replace: true });
        } else if (statusCode === 409) {
          setErro("Você já enviou uma proposta para este produto.");
        } else {
          setErro("Erro ao enviar proposta. Tente novamente.");
        }
      } else {
        setErro("Erro desconhecido. Tente novamente.");
      }
    } finally {
      setIsEnviandoProposta(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdf4_45%,#dcfce7_100%)] flex items-center justify-center">
        <p className="text-emerald-800">Carregando produto...</p>
      </div>
    );
  }

  if (erro && !produto) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdf4_45%,#dcfce7_100%)] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-600 font-semibold">{erro}</p>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-500"
        >
          Voltar para home
        </Link>
      </div>
    );
  }

  if (!produto) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdf4_45%,#dcfce7_100%)]">
      <div className="w-full px-4 py-5 sm:px-6 md:px-8">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-400/10 bg-emerald-950/80 px-5 py-3 text-slate-100 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <span className="text-sm font-bold tracking-widest text-white uppercase">
              Garimpei
            </span>
          </Link>
          <Link
            to="/propostas"
            className="text-xs font-semibold text-emerald-100 transition hover:text-white"
          >
            Minhas propostas
          </Link>
        </header>

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer mb-4 flex items-center gap-1 text-sm text-emerald-800 transition hover:text-emerald-950"
          >
            ← Voltar
          </button>

          <div className="grid gap-8 rounded-3xl border border-white/40 bg-white/85 p-6 shadow-2xl backdrop-blur md:grid-cols-2">
            {/* Imagem do Produto */}
            <div className="flex flex-col gap-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-emerald-50 flex items-center justify-center">
                {produto.imagemUrl ? (
                  <img
                    src={produto.imagemUrl}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-emerald-700">Sem imagem disponível</p>
                )}
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-black text-slate-900">
                  {produto.nome}
                </h1>
                <p className="mb-4 text-slate-600">{produto.descricao}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-600">Preço:</span>
                    <span className="text-2xl font-bold text-emerald-700">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(produto.preco)}
                    </span>
                  </div>
                  {produto.avaliacao && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Avaliação:</span>
                      <span className="font-semibold">
                        {produto.avaliacao.toFixed(1)} ⭐
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulário de Proposta */}
              <form onSubmit={handleEnviarProposta} className="space-y-4 border-t border-slate-200 pt-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Enviar Proposta
                </h3>

                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva seu interesse ou faça uma pergunta sobre o produto..."
                  className="h-24 w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                {erro && (
                  <p className="text-red-600 text-sm font-semibold">{erro}</p>
                )}

                {propostaPendente && (
                  <p className="text-green-600 text-sm font-semibold">
                    ✓ Proposta enviada com sucesso!
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isEnviandoProposta}
                  className="cursor-pointer w-full rounded-lg bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isEnviandoProposta ? "Enviando..." : "Enviar Proposta"}
                </button>
              </form>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-slate-700 px-4 py-2 text-white transition hover:bg-slate-600"
          >
            Continuar explorando
          </Link>
        </div>
      </div>
    </div>
  );
}

