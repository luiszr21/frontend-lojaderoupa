import { useEffect, useState } from "react";
import { api } from "../Services/Api";
import type { ListarProdutosResponse } from "../types";

export default function Home() {
  const [status, setStatus] = useState("Conectando ao backend...");
  const [produtos, setProdutos] = useState<ListarProdutosResponse>([]);

  useEffect(() => {
    api
      .get<ListarProdutosResponse>("/produtos")
      .then((res) => {
        setProdutos(res.data);
        setStatus(`Conectado. ${res.data.length} produto(s) recebido(s).`);
      })
      .catch((error: unknown) => {
        const mensagem =
          error instanceof Error ? error.message : "Erro ao conectar.";
        setStatus(`Falha na conexao: ${mensagem}`);
      });
  }, []);

  return (
    <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Teste de Conexao API</h2>
      <p className="mt-2 text-sm text-slate-600">Endpoint: /produtos</p>
      <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">
        {status}
      </p>

      <ul className="mt-4 space-y-2">
        {produtos.map((produto) => (
          <li
            key={produto.id}
            className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
          >
            {produto.nome} - R$ {produto.preco}
          </li>
        ))}
      </ul>
    </section>
  );
}