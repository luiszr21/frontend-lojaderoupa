import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { api } from "../Services/Api";
import type { StatusProposta } from "../types";

type StatusAdmin = Extract<StatusProposta, "respondida" | "aceita" | "rejeitada">;

interface AdminPropostaItem {
  id: string;
  status: StatusProposta;
  mensagem: string;
  resposta?: string | null;
  produtoId?: string;
  produto?: {
    id?: string;
    nome?: string;
  };
  user?: {
    id?: string;
    nome?: string;
    email?: string;
  };
}

interface ApiErrorResponse {
  erro?: string;
  campos?: Record<string, string>;
}

type AdminPropostasResponse =
  | AdminPropostaItem[]
  | { propostas: AdminPropostaItem[] };

function extrairLista(data: AdminPropostasResponse): AdminPropostaItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.propostas ?? [];
}

export default function AdminPropostas() {
  const [propostas, setPropostas] = useState<AdminPropostaItem[]>([]);
  const [statusGeral, setStatusGeral] = useState("Carregando propostas...");
  const [idProcessando, setIdProcessando] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  useEffect(() => {
    api
      .get<AdminPropostasResponse>("/admin/propostas")
      .then((res) => {
        const lista = extrairLista(res.data);
        setPropostas(lista);
        setStatusGeral(`Total de ${lista.length} proposta(s).`);
      })
      .catch(() => {
        setStatusGeral("Falha ao carregar propostas administrativas.");
      });
  }, []);

  async function atualizarStatus(proposta: AdminPropostaItem, status: StatusAdmin) {
    setIdProcessando(proposta.id);
    setStatusGeral("Atualizando status...");

    try {
      const resposta = (respostas[proposta.id] ?? "").trim();

      await api.patch(`/admin/propostas/${proposta.id}/status`, {
        status,
        resposta: resposta || undefined,
      });

      setPropostas((estadoAtual) =>
        estadoAtual.map((item) =>
          item.id === proposta.id
            ? {
                ...item,
                status,
                resposta: resposta || item.resposta,
              }
            : item,
        ),
      );

      setStatusGeral("Status atualizado com sucesso.");
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setStatusGeral(error.response?.data?.erro ?? "Falha ao atualizar status.");
      } else {
        setStatusGeral("Falha ao atualizar status.");
      }
    } finally {
      setIdProcessando(null);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)]">
      <div className="w-full px-4 py-5 sm:px-6 md:px-8">
        <header className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🛠️</span>
            <strong className="text-base font-black">Painel Admin</strong>
          </div>
          <Link to="/" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
            Voltar para vitrine
          </Link>
        </header>

        <p className="mt-4 text-sm text-slate-700">{statusGeral}</p>

        {!propostas.length ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
            Nenhuma proposta encontrada.
          </p>
        ) : (
          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {propostas.map((proposta) => {
              const processando = idProcessando === proposta.id;
              const produtoNome = proposta.produto?.nome ?? proposta.produtoId ?? "Produto";
              const clienteNome = proposta.user?.nome ?? proposta.user?.email ?? "Cliente";

              return (
                <article key={proposta.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900">{produtoNome}</h2>
                  <p className="mt-1 text-sm text-slate-600">Cliente: {clienteNome}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status atual: {proposta.status}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    <strong>Proposta:</strong> {proposta.mensagem}
                  </p>

                  <label htmlFor={`resposta-${proposta.id}`} className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Resposta do admin
                  </label>
                  <textarea
                    id={`resposta-${proposta.id}`}
                    rows={3}
                    value={respostas[proposta.id] ?? proposta.resposta ?? ""}
                    onChange={(event) =>
                      setRespostas((estadoAtual) => ({
                        ...estadoAtual,
                        [proposta.id]: event.target.value,
                      }))
                    }
                    placeholder="Mensagem para o cliente"
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => atualizarStatus(proposta, "respondida")}
                      className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Respondida
                    </button>
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => atualizarStatus(proposta, "aceita")}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Aceitar
                    </button>
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => atualizarStatus(proposta, "rejeitada")}
                      className="rounded-md bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Rejeitar
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
