import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../Services/Api";
import type { MinhasPropostasResponse, Produto, Proposta } from "../types";

type PropostasApiResponse = MinhasPropostasResponse | { propostas: MinhasPropostasResponse };

function extrairListaPropostas(data: PropostasApiResponse): MinhasPropostasResponse {
	if (Array.isArray(data)) {
		return data;
	}

	return data.propostas ?? [];
}

async function buscarMinhasPropostas(): Promise<MinhasPropostasResponse> {
	const res = await api.get<PropostasApiResponse>("/propostas/minhas");
	return extrairListaPropostas(res.data);
}

async function atualizarProposta(id: string, mensagem: string): Promise<void> {
	await api.patch(`/propostas/${id}`, { mensagem });
}

async function excluirProposta(id: string): Promise<void> {
	await api.delete(`/propostas/${id}`);
}

export default function MinhasInteracoes() {
	const [propostas, setPropostas] = useState<MinhasPropostasResponse>([]);
	const [produtos, setProdutos] = useState<Produto[]>([]);
	const [status, setStatus] = useState("Carregando suas propostas...");
	const [mensagensEditadas, setMensagensEditadas] = useState<Record<string, string>>({});
	const [idProcessando, setIdProcessando] = useState<string | null>(null);

	useEffect(() => {
		async function carregar() {
			try {
				const [listaPropostas, listaProdutos] = await Promise.all([
					buscarMinhasPropostas(),
					api.get<Produto[]>("/produtos").then((res) => res.data).catch(() => []),
				]);
				setPropostas(listaPropostas);
				setProdutos(listaProdutos);
				setStatus(`Você possui ${listaPropostas.length} proposta(s).`);
			} catch {
				setStatus("Falha ao carregar propostas. Tente novamente.");
			}
		}

		carregar();

		function onPropostasUpdated() {
			carregar();
		}

		window.addEventListener("propostas:updated", onPropostasUpdated as EventListener);

		return () => {
			window.removeEventListener("propostas:updated", onPropostasUpdated as EventListener);
		};
	}, []);

	const produtoPorId = useMemo(() => {
		return new Map(produtos.map((produto) => [produto.id, produto]));
	}, [produtos]);

	function getMensagemAtual(proposta: Proposta): string {
		return mensagensEditadas[proposta.id] ?? proposta.mensagem;
	}

	async function handleSalvarAlteracao(proposta: Proposta) {
		const mensagemAtual = getMensagemAtual(proposta).trim();

		if (!mensagemAtual) {
			setStatus("A mensagem da proposta não pode ficar vazia.");
			return;
		}

		setIdProcessando(proposta.id);
		setStatus("Salvando alteração...");

		try {
			await atualizarProposta(proposta.id, mensagemAtual);
			setPropostas((estadoAtual) =>
				estadoAtual.map((item) =>
					item.id === proposta.id ? { ...item, mensagem: mensagemAtual } : item,
				),
			);
			setStatus("Proposta alterada com sucesso.");
		} catch {
			setStatus("Não foi possível alterar a proposta.");
		} finally {
			setIdProcessando(null);
		}
	}

	async function handleDesfazer(proposta: Proposta) {
		setIdProcessando(proposta.id);
		setStatus("Desfazendo proposta...");

		try {
			await excluirProposta(proposta.id);
			setPropostas((estadoAtual) => estadoAtual.filter((item) => item.id !== proposta.id));
			setStatus("Proposta desfeita com sucesso.");
		} catch {
			setStatus("Não foi possível desfazer a proposta.");
		} finally {
			setIdProcessando(null);
		}
	}

	return (
		<div className="min-h-screen bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdf4_45%,#dcfce7_100%)]">
			<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<header className="sticky top-4 z-40 mb-6 flex items-center justify-between rounded-2xl border border-emerald-400/10 bg-emerald-950/80 px-5 py-3 text-slate-100 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
					<div className="flex items-center gap-2.5">
						<span className="text-sm font-bold tracking-widest text-white uppercase" aria-hidden="true">
							 Minhas propostas
						</span>
					</div>
					<Link to="/cliente" className="text-xs font-semibold text-emerald-100 transition hover:text-white">
						Voltar a Garimpar
					</Link>
				</header>

				<div className="mb-4 flex items-center justify-between">
					<p className="text-sm text-emerald-900">{status}</p>
				</div>

				{!propostas.length ? (
					<p className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-4 py-6 text-sm text-emerald-900 shadow-sm">
						Você ainda não fez propostas.
					</p>
				) : (
					<section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{propostas.map((proposta) => {
							const produto = produtoPorId.get(proposta.produtoId);
							const processando = idProcessando === proposta.id;

							return (
								<article key={proposta.id} className="rounded-3xl border border-white/40 bg-white/85 p-5 shadow-2xl backdrop-blur">
									<h2 className="text-lg font-black text-slate-900">
										{produto?.nome ?? `Produto ${proposta.produtoId}`}
									</h2>
									<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
										Status: {proposta.status}
									</p>
									<p className="mt-2 text-sm text-slate-700">
										<strong>Tamanho:</strong> {produto?.tamanho ?? "Não informado"}
									</p>
									<p className="mt-1 text-sm text-slate-700">
										<strong>Descrição:</strong> {produto?.descricao ?? "Sem descrição"}
									</p>

									{proposta.resposta ? (
										<div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
												Resposta do admin
											</p>
											<p className="mt-2 whitespace-pre-wrap text-sm text-emerald-950">
												{proposta.resposta}
											</p>
											{proposta.dataResponsta ? (
												<p className="mt-2 text-xs text-emerald-700">
													Respondido em: {new Date(proposta.dataResponsta).toLocaleDateString("pt-BR")}
												</p>
											) : null}
										</div>
									) : null}

									<label htmlFor={`mensagem-${proposta.id}`} className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">
										Sua mensagem
									</label>
									<textarea
										id={`mensagem-${proposta.id}`}
										rows={4}
										value={getMensagemAtual(proposta)}
										onChange={(event) =>
											setMensagensEditadas((estadoAtual) => ({
												...estadoAtual,
												[proposta.id]: event.target.value,
											}))
										}
										className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
									/>

									<div className="mt-3 flex items-center gap-2">
										<button
											type="button"
											onClick={() => handleSalvarAlteracao(proposta)}
											disabled={processando}
											className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{processando ? "Salvando..." : "Alterar proposta"}
										</button>
										<button
											type="button"
											onClick={() => handleDesfazer(proposta)}
											disabled={processando}
											className="cursor-pointer rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Desfazer proposta
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
