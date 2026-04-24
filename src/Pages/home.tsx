import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { api } from "../Services/Api";
import CardProduto from "../components/CardProduto";
import type { ListarProdutosResponse } from "../types";
import { useAuthStore } from "../stores/authStore";

export default function Home() {
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [somenteDestaques, setSomenteDestaques] = useState(false);
  const [status, setStatus] = useState("Conectando ao backend...");
  const [produtos, setProdutos] = useState<ListarProdutosResponse>([]);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    const endpoint = somenteDestaques ? "/produtos/destaques" : "/produtos";

    setStatus(
      somenteDestaques
        ? "Carregando produtos em destaque..."
        : "Conectando ao backend...",
    );

    api
      .get<ListarProdutosResponse>(endpoint)
      .then((res) => {
        setProdutos(res.data);
        setStatus(
          somenteDestaques
            ? `Conectado. ${res.data.length} destaque(s) recebido(s).`
            : `Conectado. ${res.data.length} produto(s) recebido(s).`,
        );
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          setStatus(
            somenteDestaques
              ? "Falha no servidor ao carregar destaques. Tente novamente."
              : "Falha no servidor ao carregar produtos. Tente novamente.",
          );
          return;
        }

        const mensagem =
          error instanceof Error ? error.message : "Erro ao conectar.";
        setStatus(
          somenteDestaques
            ? `Falha na conexao ao carregar destaques: ${mensagem}`
            : `Falha na conexao: ${mensagem}`,
        );
      });
  }, [somenteDestaques]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return produtos;
    }

    return produtos.filter((produto) => {
      const nome = produto.nome.toLowerCase();
      const descricao = (produto.descricao ?? "").toLowerCase();

      return nome.includes(termo) || descricao.includes(termo);
    });
  }, [busca, produtos]);

  const produtosVisiveis = produtosFiltrados;

  function handlePesquisar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusca(buscaInput);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)]">
      <div className="w-full px-4 py-5 sm:px-6 md:px-8">
        <header className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">👕</span>
            <strong className="text-base font-black">Vitrine </strong>
          </div>
          <div className="flex items-center gap-4">
            {token && role === "user" ? (
              <Link
                to="/cliente/minhas-propostas"
                className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Minhas propostas
              </Link>
            ) : null}
            {token && role === "admin" ? (
              <Link
                to="/admin"
                className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Propostas admin
              </Link>
            ) : null}
            <Link
              to={token ? "/conta" : "/login"}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              {token ? "Minha conta" : "Identifique-se"}
            </Link>
          </div>
        </header>

        <form
          onSubmit={handlePesquisar}
          className="mt-4 flex flex-col gap-3 md:flex-row md:items-center"
        >
          <input
            id="busca"
            type="text"
            value={buscaInput}
            onChange={(event) => setBuscaInput(event.target.value)}
            placeholder="Modelo, marca, preço máximo ou ano"
            className="h-11 flex-1 rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          />

          <button
            type="submit"
            className="h-11 rounded-md bg-cyan-600 px-5 text-sm font-bold text-white transition hover:bg-cyan-500"
          >
            Pesquisar
          </button>

          <button
            type="button"
            onClick={() => setSomenteDestaques((valorAtual) => !valorAtual)}
            className="h-11 rounded-md bg-slate-700 px-5 text-sm font-bold text-white transition hover:bg-slate-600"
          >
            {somenteDestaques ? "Exibir todos" : "Exibir destaques"}
          </button>
        </form>

        <div className="mt-6">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Roupas em destaque
          </h1>
          
          <p className="mt-2 text-sm text-slate-600">{status}</p>
          {!token ? (
            <p className="mt-1 text-sm text-slate-700">
              Para enviar proposta ou interagir com os itens, faça
              <Link to="/login" className="mx-1 font-bold text-cyan-700 hover:text-cyan-600">
                login
              </Link>
              ou
              <Link to="/cadastro" className="mx-1 font-bold text-cyan-700 hover:text-cyan-600">
                cadastre-se
              </Link>
              .
            </p>
          ) : null}
        </div>

        {!produtosVisiveis.length ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
            Nenhuma roupa encontrada para esse filtro.
          </p>
        ) : (
          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {produtosVisiveis.map((produto) => (
              <CardProduto
                key={produto.id}
                produto={produto}
                detalhe="Coleção disponível"
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}